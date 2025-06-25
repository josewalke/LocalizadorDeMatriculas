import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';

// Importar servicios y utilidades
import { PlateRecognizerService } from './src/services/plateRecognizer';
import { LocationService } from './src/services/locationService';
import { apiService } from './src/services/apiService';
import { useImagePicker } from './src/hooks/useImagePicker';
import { useBackendConnection } from './src/hooks/useBackendConnection';

// Importar componentes
import { InfoModal } from './src/components/InfoModal';
import { PlateDisplay } from './src/components/PlateDisplay';
import { MapDisplay } from './src/components/MapDisplay';
import { BackendHistoryModal } from './src/components/BackendHistoryModal';
import { ConnectionStatus } from './src/components/ConnectionStatus';
import { PreSaveEditModal } from './src/components/PreSaveEditModal';

// Importar tipos y configuración
import { AppState, ImageData, LocationData, PlateRecognitionResult, PlateData } from './src/types';
import { CONFIG, ERROR_MESSAGES } from './src/config';

export default function App() {
  const [state, setState] = useState<AppState>({
    image: null,
    location: null,
    plate: null,
    isLoading: false,
    error: null,
  });

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showPreSaveEditModal, setShowPreSaveEditModal] = useState(false);
  
  const { pickImageFromGallery, takePhoto, isLoading: pickerLoading } = useImagePicker();
  
  // Hook para verificar conectividad al backend
  const { 
    isConnected: backendConnected, 
    isLoading: connectionLoading, 
    error: connectionError, 
    retryConnection 
  } = useBackendConnection();

  const [editablePlate, setEditablePlate] = useState<string | null>(null);
  const [plateChanged, setPlateChanged] = useState(false);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const processImage = async (imageData: ImageData) => {
    setLoading(true);
    setError(null);

    try {
      // Establecer la imagen
      setState(prev => ({ ...prev, image: imageData }));

      // Obtener ubicación
      let locationData: LocationData | null = null;
      
      if (Platform.OS === 'web' && imageData.file) {
        // En web, intentar extraer GPS de la imagen
        locationData = await LocationService.getLocationFromImage(imageData.file);
      } else {
        // En móvil, usar ubicación del dispositivo
        locationData = await LocationService.getDeviceLocation();
      }

      if (locationData) {
        setState(prev => ({ ...prev, location: locationData }));
      }

      // Reconocer matrícula
      const plateResult = await PlateRecognizerService.recognizePlate(
        imageData.uri, 
        imageData.file
      );

      setState(prev => ({ 
        ...prev, 
        plate: plateResult,
        location: locationData || prev.location 
      }));

      setEditablePlate(plateResult.plate);
      setPlateChanged(false);

      // Mostrar modal de edición previa si está conectado al backend
      if (backendConnected && locationData) {
        console.log('📝 [App] Mostrando modal de edición previa');
        setShowPreSaveEditModal(true);
      } else if (!backendConnected) {
        console.log('⚠️ Backend no conectado');
        Alert.alert(
          'Sin conexión', 
          'No hay conexión al servidor. No se puede guardar la matrícula.'
        );
      }

    } catch (error) {
      console.error('Error procesando imagen:', error);
      const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePreSaveEditSave = async (editedPlateData: PlateData) => {
    try {
      console.log('💾 [App] Guardando matrícula editada:', editedPlateData);

      // Enviar al backend con la imagen
      const savedPlate = await apiService.createPlate(editedPlateData, state.image?.uri);
      console.log('✅ Matrícula guardada en backend:', savedPlate);
      
      // Cerrar el modal de edición
      setShowPreSaveEditModal(false);
      
      Alert.alert(
        'Éxito', 
        `Matrícula ${editedPlateData.plate} guardada correctamente en el servidor.`
      );
    } catch (backendError) {
      console.error('❌ Error enviando al backend:', backendError);
      Alert.alert(
        'Error', 
        'La matrícula se reconoció pero no se pudo guardar en el servidor.'
      );
    }
  };

  const handlePreSaveEditCancel = () => {
    console.log('❌ [App] Cancelando guardado de matrícula');
    setShowPreSaveEditModal(false);
  };

  const handlePickImage = async () => {
    const imageData = await pickImageFromGallery();
    if (imageData) {
      await processImage(imageData);
    }
  };

  const handleTakePhoto = async () => {
    const imageData = await takePhoto();
    if (imageData) {
      await processImage(imageData);
    }
  };

  const handlePlateEdit = (text: string) => {
    setEditablePlate(text);
    if (state.plate && text !== state.plate.plate) {
      setPlateChanged(true);
    } else {
      setPlateChanged(false);
    }
  };

  const handleSaveEditedPlate = async () => {
    if (!state.plate || !state.location || !state.image || !editablePlate) return;
    try {
      setLoading(true);
      const plateData: PlateData = {
        plate: editablePlate,
        latitude: state.location.latitude,
        longitude: state.location.longitude,
        accuracy: state.location.accuracy,
        confidence: state.plate.confidence,
      };
      const savedPlate = await apiService.createPlate(plateData, state.image.uri);
      Alert.alert('Éxito', `Matrícula ${editablePlate} guardada correctamente en el servidor.`);
      setEditablePlate(null);
      setPlateChanged(false);
      setState(prev => ({ ...prev, plate: null, image: null, location: null }));
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar la matrícula.');
    } finally {
      setLoading(false);
    }
  };

  const isWeb = Platform.OS === 'web';
  const isLoading = state.isLoading || pickerLoading;

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.title}>{CONFIG.APP.NAME}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => setShowHistoryModal(true)}
          >
            <Text style={styles.historyButtonText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={() => setShowInfoModal(true)}
          >
            <Text style={styles.infoButtonText}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Indicador de estado de conexión al backend */}
      <ConnectionStatus
        connectionState={{
          isConnected: backendConnected,
          isLoading: connectionLoading,
          error: connectionError,
          lastChecked: new Date(),
        }}
        onRetry={retryConnection}
      />

      <InfoModal 
        visible={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />

      <BackendHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      <PreSaveEditModal
        visible={showPreSaveEditModal}
        plateResult={state.plate}
        locationData={state.location}
        imageUri={state.image?.uri || null}
        onSave={handlePreSaveEditSave}
        onCancel={handlePreSaveEditCancel}
      />

      <Text style={styles.subtitle}>
        {isWeb ? 'Versión Web - Sube una foto de un coche' : 'Toma o selecciona una foto de un coche'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isWeb ? 'Subir archivo' : 'Tomar foto'}
          onPress={isWeb ? handleTakePhoto : handleTakePhoto}
          disabled={isLoading}
        />
        <View style={{ height: 16 }} />
        <Button
          title="Seleccionar de galería"
          onPress={handlePickImage}
          disabled={isLoading}
        />
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Reconociendo matrícula...</Text>
        </View>
      )}

      {state.image && (
        <View style={styles.imageContainer}>
          <Text style={styles.imageTitle}>Imagen seleccionada:</Text>
          <Image 
            source={{ uri: state.image.uri }} 
            style={styles.image} 
            resizeMode="cover" 
          />
        </View>
      )}

      {state.plate && (
        <View style={{ width: '100%', maxWidth: 400, alignItems: 'center', marginBottom: 18 }}>
          <Text style={styles.plateTitle}>Matrícula reconocida (puedes corregirla):</Text>
          <TextInput
            style={styles.plateEditInput}
            value={editablePlate ?? ''}
            onChangeText={handlePlateEdit}
            maxLength={10}
            autoCapitalize="characters"
            editable={true}
          />
          {plateChanged && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveEditedPlate}
              disabled={isLoading}
            >
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {state.location && state.plate && !isLoading && (
        <MapDisplay location={state.location} plate={state.plate} />
      )}

      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {state.error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 16,
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  headerButtons: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e6f3ff',
    marginRight: 8,
  },
  historyButtonText: {
    fontSize: 22,
    color: '#0056b3',
    fontWeight: 'bold',
  },
  infoButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e6f3ff',
  },
  infoButtonText: {
    fontSize: 22,
    color: '#0056b3',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 18,
    textAlign: 'center',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 18,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    maxWidth: 340,
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginBottom: 4,
  },
  errorContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f5c6cb',
    marginTop: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
    textAlign: 'center',
  },
  plateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0056b3',
    textAlign: 'center',
  },
  plateEditInput: {
    borderWidth: 1,
    borderColor: '#007BFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 22,
    color: '#004085',
    letterSpacing: 3,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    width: '100%',
    maxWidth: 340,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
