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
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import { PlateResponse, PlateData, LocationData } from '../types';
import { apiService } from '../services/apiService';
import { useImagePicker } from '../hooks/useImagePicker';
import { MiniMap } from './MiniMap';

interface EditPlateModalProps {
  visible: boolean;
  plate: PlateResponse | null;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditPlateModal: React.FC<EditPlateModalProps> = ({
  visible,
  plate,
  onClose,
  onUpdate,
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

  // Cargar datos de la matrícula cuando se abre el modal
  useEffect(() => {
    if (visible && plate) {
      setFormData({
        plate: plate.plate,
        latitude: plate.latitude,
        longitude: plate.longitude,
        accuracy: plate.accuracy || 0,
        confidence: plate.confidence || 0,
      });
      setNewImageUri(null);
    }
  }, [visible, plate]);

  const handleInputChange = (field: keyof PlateData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
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
    if (!plate) return;

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
      console.log(`✏️ [EditPlateModal] Guardando cambios para ID: ${plate.id}`);
      
      await apiService.updatePlate(plate.id, formData, newImageUri || undefined);
      
      console.log(`✅ [EditPlateModal] Matrícula actualizada exitosamente`);
      
      Alert.alert('Éxito', 'Matrícula actualizada correctamente');
      onUpdate(); // Recargar la lista
      onClose();
      
    } catch (error) {
      console.error(`❌ [EditPlateModal] Error actualizando matrícula:`, error);
      Alert.alert('Error', 'No se pudo actualizar la matrícula');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar edición',
      '¿Estás seguro de que quieres cancelar? Los cambios no guardados se perderán.',
      [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: onClose },
      ]
    );
  };

  if (!plate) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar Matrícula</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Matrícula editable */}
            <View style={styles.plateSection}>
              <Text style={styles.sectionTitle}>Matrícula actual</Text>
              <Text style={styles.descriptionText}>
                Edita la matrícula si es necesario
              </Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Matrícula:</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.plate}
                  onChangeText={(value) => handleInputChange('plate', value.toUpperCase())}
                  placeholder="Ej: 1234ABC"
                  maxLength={10}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Ubicación en mapa */}
            <View style={styles.mapSection}>
              <Text style={styles.sectionTitle}>Ubicación registrada</Text>
              <MiniMap location={{
                latitude: formData.latitude,
                longitude: formData.longitude,
                accuracy: formData.accuracy || 0,
                timestamp: Date.now()
              }} />
              
              <View style={styles.locationInfo}>
                <Text style={styles.locationText}>
                  📍 Lat: {formData.latitude.toFixed(6)}
                </Text>
                <Text style={styles.locationText}>
                  📍 Lon: {formData.longitude.toFixed(6)}
                </Text>
              </View>
            </View>

            {/* Imagen del coche */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Imagen del vehículo</Text>
              
              {/* Imagen actual */}
              {plate.image_filename && (
                <View style={styles.currentImageContainer}>
                  <Text style={styles.imageLabel}>Imagen actual:</Text>
                  <Image 
                    source={{ uri: apiService.getImageUrl(plate.image_filename) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              )}
              
              {/* Nueva imagen */}
              <View style={styles.newImageContainer}>
                <Text style={styles.imageLabel}>Nueva imagen (opcional):</Text>
                <View style={styles.imageButtons}>
                  <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                    <Text style={styles.imageButtonText}>📷 Nueva foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                    <Text style={styles.imageButtonText}>🖼️ Galería</Text>
                  </TouchableOpacity>
                </View>
                {newImageUri && (
                  <Image 
                    source={{ uri: newImageUri }}
                    style={styles.newImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          </ScrollView>

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
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
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
  scrollView: {
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
  currentImageContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  newImageContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
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
  newImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
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
}); 