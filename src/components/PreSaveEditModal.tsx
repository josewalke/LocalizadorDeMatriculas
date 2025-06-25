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
    Alert.alert(
      'Cancelar',
      '¿Estás seguro de que quieres cancelar? La matrícula no se guardará.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: onCancel },
      ]
    );
  };

  if (!plateResult || !locationData) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modal}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Corregir matrícula</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Matrícula editable */}
            <View style={styles.plateSection}>
              <Text style={styles.sectionTitle}>Matrícula reconocida</Text>
              <Text style={styles.descriptionText}>
                Revisa y corrige la matrícula si es necesario
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Matrícula:</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.plate}
                  onChangeText={handlePlateEdit}
                  placeholder="Ej: 1234ABC"
                  maxLength={10}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Ubicación en mapa */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>Ubicación detectada</Text>
              <MiniMap location={{
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                accuracy: locationData.accuracy,
                timestamp: Date.now()
              }} />
              
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  📍 Lat: {locationData.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  📍 Lon: {locationData.longitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  🎯 Precisión: {locationData.accuracy?.toFixed(1) || 'N/A'} metros
                </Text>
              </View>
            </View>

            {/* Imagen del coche */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Imagen del vehículo</Text>
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
              
              <View style={styles.imageButtons}>
                <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                  <Text style={styles.imageButtonText}>📷 Nueva foto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                  <Text style={styles.imageButtonText}>🖼️ Galería</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={handleSave}
              disabled={isLoading}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxHeight: '90%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  plateSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  mapSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  imageSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff8f0',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    backgroundColor: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  noImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
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
    alignItems: 'center',
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#28a745',
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
    borderRadius: 16,
  },
  locationInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
}); 