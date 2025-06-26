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
import { useResponsive, getResponsiveValue, getResponsiveFontSize } from '../hooks/useResponsive';
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
    console.log('❌ [EditPlateModal] Botón cancelar presionado');
    // Cerrar directamente sin confirmación
    onClose();
  };

  const handleClose = () => {
    console.log('❌ [EditPlateModal] Botón X presionado');
    // Cerrar directamente sin confirmación
    onClose();
  };

  if (!plate) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Editar Matrícula</Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
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
              <Text style={styles.sectionTitle}>🚗 Imagen del vehículo</Text>
              
              {/* Imagen actual */}
              {plate.image_filename ? (
                <View style={styles.currentImageContainer}>
                  <Text style={styles.imageLabel}>📸 Imagen actual del vehículo</Text>
                  <Image 
                    source={{ uri: apiService.getImageUrl(plate.image_filename) }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <Text style={styles.imageInfo}>
                    📁 Archivo: {plate.image_filename}
                  </Text>
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Text style={styles.noImageText}>📷 No hay imagen disponible</Text>
                </View>
              )}
              
              {/* Nueva imagen */}
              <View style={styles.newImageContainer}>
                <Text style={styles.imageLabel}>🆕 Cambiar imagen (opcional)</Text>
                <Text style={styles.imageDescription}>
                  Puedes tomar una nueva foto o seleccionar una de la galería
                </Text>
                <View style={styles.imageButtons}>
                  <TouchableOpacity style={styles.imageButton} onPress={handleTakePhoto}>
                    <Text style={styles.imageButtonText}>📷 Nueva foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                    <Text style={styles.imageButtonText}>🖼️ Galería</Text>
                  </TouchableOpacity>
                </View>
                {newImageUri && (
                  <View style={styles.newImagePreview}>
                    <Text style={styles.newImageLabel}>🆕 Vista previa de la nueva imagen:</Text>
                    <Image 
                      source={{ uri: newImageUri }}
                      style={styles.newImage}
                      resizeMode="cover"
                    />
                  </View>
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
    padding: getResponsiveValue(16, 24, 32),
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: getResponsiveValue(16, 20, 24),
    padding: getResponsiveValue(24, 28, 32),
    margin: getResponsiveValue(20, 24, 28),
    maxHeight: getResponsiveValue('90%', '85%', '80%'),
    width: '100%',
    maxWidth: getResponsiveValue('90%', '85%', '80%'),
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
    marginBottom: getResponsiveValue(20, 24, 28),
    paddingBottom: getResponsiveValue(16, 20, 24),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    marginBottom: getResponsiveValue(24, 28, 32),
    padding: getResponsiveValue(16, 18, 20),
    backgroundColor: '#f8f9fa',
    borderRadius: getResponsiveValue(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  mapSection: {
    marginBottom: getResponsiveValue(24, 28, 32),
    padding: getResponsiveValue(16, 18, 20),
    backgroundColor: '#f0f8ff',
    borderRadius: getResponsiveValue(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  imageSection: {
    marginBottom: getResponsiveValue(24, 28, 32),
    padding: getResponsiveValue(16, 18, 20),
    backgroundColor: '#fff8f0',
    borderRadius: getResponsiveValue(12, 16, 20),
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize(18),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: getResponsiveValue(8, 10, 12),
    textAlign: 'center',
  },
  descriptionText: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginBottom: getResponsiveValue(16, 18, 20),
    textAlign: 'center',
    lineHeight: getResponsiveValue(20, 22, 24),
  },
  inputGroup: {
    marginBottom: getResponsiveValue(16, 18, 20),
  },
  inputLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#555',
    marginBottom: getResponsiveValue(8, 10, 12),
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: getResponsiveValue(8, 12, 16),
    padding: getResponsiveValue(12, 14, 16),
    fontSize: getResponsiveFontSize(18),
    backgroundColor: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  locationInfo: {
    marginTop: getResponsiveValue(12, 14, 16),
    padding: getResponsiveValue(12, 14, 16),
    backgroundColor: '#f8f9fa',
    borderRadius: getResponsiveValue(8, 12, 16),
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  locationText: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginBottom: getResponsiveValue(4, 6, 8),
  },
  currentImageContainer: {
    marginBottom: getResponsiveValue(20, 24, 28),
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: getResponsiveValue(16, 18, 20),
    borderRadius: getResponsiveValue(12, 16, 20),
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newImageContainer: {
    marginBottom: getResponsiveValue(12, 14, 16),
    alignItems: 'center',
    backgroundColor: '#f0fff0',
    padding: getResponsiveValue(16, 18, 20),
    borderRadius: getResponsiveValue(12, 16, 20),
    borderWidth: 2,
    borderColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: getResponsiveValue(12, 14, 16),
    textAlign: 'center',
  },
  image: {
    width: getResponsiveValue(280, 320, 360),
    height: getResponsiveValue(200, 240, 280),
    borderRadius: getResponsiveValue(12, 16, 20),
    marginBottom: getResponsiveValue(8, 10, 12),
    borderWidth: 3,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: getResponsiveValue(16, 18, 20),
    width: '100%',
  },
  imageButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: getResponsiveValue(20, 24, 28),
    paddingVertical: getResponsiveValue(12, 14, 16),
    borderRadius: getResponsiveValue(10, 12, 14),
    minWidth: getResponsiveValue(120, 140, 160),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  imageButtonText: {
    color: 'white',
    fontSize: getResponsiveFontSize(14),
    fontWeight: 'bold',
  },
  newImage: {
    width: getResponsiveValue(280, 320, 360),
    height: getResponsiveValue(200, 240, 280),
    borderRadius: getResponsiveValue(12, 16, 20),
    borderWidth: 3,
    borderColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
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
    paddingVertical: getResponsiveValue(14, 16, 18),
    borderRadius: getResponsiveValue(10, 12, 14),
    alignItems: 'center',
    marginHorizontal: getResponsiveValue(8, 10, 12),
    minHeight: getResponsiveValue(48, 56, 64),
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
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
  imageInfo: {
    fontSize: getResponsiveFontSize(12),
    color: '#666',
    marginTop: getResponsiveValue(4, 6, 8),
  },
  noImageContainer: {
    marginBottom: getResponsiveValue(12, 14, 16),
    alignItems: 'center',
    backgroundColor: '#f0fff0',
    padding: getResponsiveValue(12, 14, 16),
    borderRadius: getResponsiveValue(8, 12, 16),
    borderWidth: 1,
    borderColor: '#28a745',
  },
  noImageText: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
  },
  newImagePreview: {
    marginBottom: getResponsiveValue(12, 14, 16),
    alignItems: 'center',
    backgroundColor: '#f0fff0',
    padding: getResponsiveValue(12, 14, 16),
    borderRadius: getResponsiveValue(8, 12, 16),
    borderWidth: 1,
    borderColor: '#28a745',
  },
  newImageLabel: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: getResponsiveValue(8, 10, 12),
    textAlign: 'center',
  },
  imageDescription: {
    fontSize: getResponsiveFontSize(14),
    color: '#666',
    marginBottom: getResponsiveValue(12, 14, 16),
    textAlign: 'center',
  },
}); 