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
    padding: 16,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
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
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  plateSection: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 14,
    fontSize: 20,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  infoSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'monospace',
  },
  mapSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  imageSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  noImageContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    fontSize: 16,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    minHeight: 44,
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    minHeight: 44,
  },
  saveButton: {
    backgroundColor: '#28a745',
    minHeight: 44,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
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