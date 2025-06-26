import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import { PlateData, LocationData, PlateRecognitionResult } from '../types';
import { useImagePicker } from '../hooks/useImagePicker';
import { useResponsive, getResponsiveValue, getResponsiveFontSize } from '../hooks/useResponsive';
import { MiniMap } from './MiniMap';

interface PreSaveEditModalProps {
  visible: boolean;
  plateResult: PlateRecognitionResult | null;
  locationData: LocationData | null;
  imageUri: string | null;
  onSave: (plateData: PlateData) => void;
  onCancel: () => void;
}

export const PreSaveEditModal: React.FC<PreSaveEditModalProps> = ({
  visible,
  plateResult,
  locationData,
  imageUri,
  onSave,
  onCancel,
}) => {
  const { isPhone, isTablet, isLandscape } = useResponsive();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<PlateData>({
    plate: '',
    latitude: 0,
    longitude: 0,
    accuracy: 0,
    confidence: 0,
  });
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  
  const { pickImageFromGallery, takePhoto } = useImagePicker();

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (visible && plateResult && locationData) {
      setFormData({
        plate: plateResult.plate,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy || 0,
        confidence: plateResult.confidence || 0,
      });
      setNewImageUri(null);
    }
  }, [visible, plateResult, locationData]);

  const handleInputChange = (field: keyof PlateData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePlateEdit = (text: string) => {
    setFormData(prev => ({
      ...prev,
      plate: text.toUpperCase(),
    }));
  };

  const handlePickImage = async () => {
    const imageData = await pickImageFromGallery();
    if (imageData) {
      setNewImageUri(imageData.uri);
    }
  };

  const handleTakePhoto = async () => {
    const imageData = await takePhoto();
    if (imageData) {
      setNewImageUri(imageData.uri);
    }
  };

  const handleSave = async () => {
    // Validar datos
    if (!formData.plate.trim()) {
      Alert.alert('Error', 'La matrícula no puede estar vacía');
      return;
    }

    if (formData.latitude === 0 && formData.longitude === 0) {
      Alert.alert('Error', 'Las coordenadas no pueden ser 0,0');
      return;
    }

    setIsLoading(true);

    try {
      console.log(`💾 [PreSaveEditModal] Guardando matrícula editada:`, formData);
      
      // Llamar a la función onSave con los datos editados
      await onSave(formData);
      
      console.log(`✅ [PreSaveEditModal] Matrícula guardada exitosamente`);
      
    } catch (error) {
      console.error(`❌ [PreSaveEditModal] Error guardando matrícula:`, error);
      Alert.alert('Error', 'No se pudo guardar la matrícula');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    console.log('❌ [PreSaveEditModal] Botón cancelar presionado');
    // Cerrar directamente sin confirmación
    onCancel();
  };

  const handleClose = () => {
    console.log('❌ [PreSaveEditModal] Botón X presionado');
    // Cerrar directamente sin confirmación
    onCancel();
  };

  if (!plateResult || !locationData) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>📝 Revisar matrícula</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Matrícula editable */}
            <View style={styles.plateSection}>
              <Text style={styles.sectionTitle}>🚗 Matrícula detectada</Text>
              <TextInput
                style={styles.textInput}
                value={formData.plate}
                onChangeText={handlePlateEdit}
                placeholder="Ej: 1234ABC"
                maxLength={10}
                autoCapitalize="characters"
              />
            </View>

            {/* Información compacta */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📍 Ubicación:</Text>
                <Text style={styles.infoValue}>
                  {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🎯 Precisión:</Text>
                <Text style={styles.infoValue}>
                  {locationData.accuracy?.toFixed(1) || 'N/A'} m
                </Text>
              </View>
            </View>

            {/* Mapa compacto */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>🗺️ Ubicación</Text>
              <MiniMap location={{
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                accuracy: locationData.accuracy,
                timestamp: Date.now()
              }} />
            </View>

            {/* Imagen compacta */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>📸 Imagen</Text>
              <View style={styles.imageContainer}>
                {newImageUri ? (
                  <Image 
                    source={{ uri: newImageUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : imageUri ? (
                  <Image 
                    source={{ uri: imageUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>Sin imagen</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                  <Text style={styles.imageButtonText}>📷 Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                  <Text style={styles.imageButtonText}>🖼️ Galería</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={() => {
                console.log('❌ [PreSaveEditModal] Botón cancelar presionado (inline)');
                onCancel();
              }}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>❌ Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveValue(16, 24, 32),
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: getResponsiveValue(20, 24, 28),
    padding: getResponsiveValue(20, 24, 28),
    width: '100%',
    maxWidth: getResponsiveValue(500, 600, 700),
    maxHeight: getResponsiveValue('90%', '85%', '80%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(16, 20, 24),
    paddingBottom: getResponsiveValue(12, 16, 20),
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: getResponsiveFontSize(20),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: getResponsiveValue(8, 12, 16),
    borderRadius: getResponsiveValue(20, 24, 28),
    backgroundColor: '#f8f9fa',
    minWidth: getResponsiveValue(36, 44, 52),
    minHeight: getResponsiveValue(36, 44, 52),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  closeButtonText: {
    fontSize: getResponsiveFontSize(20),
    color: '#666',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  plateSection: {
    marginBottom: getResponsiveValue(20, 24, 28),
    padding: getResponsiveValue(18, 20, 24),
    backgroundColor: '#f8f9fa',
    borderRadius: getResponsiveValue(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: getResponsiveValue(14, 16, 18),
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: getResponsiveValue(8, 12, 16),
    padding: getResponsiveValue(14, 16, 18),
    fontSize: getResponsiveFontSize(20),
    backgroundColor: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  infoSection: {
    marginBottom: getResponsiveValue(20, 24, 28),
    padding: getResponsiveValue(16, 18, 20),
    backgroundColor: '#f0f8ff',
    borderRadius: getResponsiveValue(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveValue(8, 10, 12),
  },
  infoLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: getResponsiveFontSize(16),
    color: '#666',
    fontFamily: 'monospace',
  },
  mapSection: {
    marginBottom: getResponsiveValue(20, 24, 28),
    padding: getResponsiveValue(16, 18, 20),
    backgroundColor: '#fff8f0',
    borderRadius: getResponsiveValue(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  imageSection: {
    marginBottom: getResponsiveValue(20, 24, 28),
    padding: getResponsiveValue(16, 18, 20),
    backgroundColor: '#f0f8ff',
    borderRadius: getResponsiveValue(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  imageContainer: {
    width: '100%',
    height: getResponsiveValue(180, 220, 260),
    borderRadius: getResponsiveValue(8, 12, 16),
    marginBottom: getResponsiveValue(10, 12, 14),
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: getResponsiveValue(8, 12, 16),
  },
  noImageContainer: {
    width: '100%',
    height: getResponsiveValue(180, 220, 260),
    backgroundColor: '#f5f5f5',
    borderRadius: getResponsiveValue(8, 12, 16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: getResponsiveFontSize(16),
    color: '#999',
    fontStyle: 'italic',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: getResponsiveValue(8, 10, 12),
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: getResponsiveValue(16, 20, 24),
    paddingVertical: getResponsiveValue(8, 10, 12),
    borderRadius: getResponsiveValue(8, 12, 16),
    minWidth: getResponsiveValue(80, 100, 120),
    alignItems: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: getResponsiveFontSize(14),
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: getResponsiveValue(20, 24, 28),
    paddingTop: getResponsiveValue(16, 20, 24),
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    paddingVertical: getResponsiveValue(12, 14, 16),
    borderRadius: getResponsiveValue(8, 12, 16),
    alignItems: 'center',
    marginHorizontal: getResponsiveValue(8, 10, 12),
    minHeight: getResponsiveValue(48, 56, 64),
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
}); 