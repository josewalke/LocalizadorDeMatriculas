import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
  StatusBar,
} from 'react-native';

// Importar servicios y utilidades
import { PlateRecognizerService } from './src/services/plateRecognizer';
import { LocationService } from './src/services/locationService';
import { apiService } from './src/services/apiService';
import { useImagePicker } from './src/hooks/useImagePicker';
import { useBackendConnection } from './src/hooks/useBackendConnection';
import { useResponsive, getResponsiveValue, getResponsiveFontSize } from './src/hooks/useResponsive';

// Importar componentes
import { InfoModal } from './src/components/InfoModal';
import { PlateDisplay } from './src/components/PlateDisplay';
import { BackendHistoryModal } from './src/components/BackendHistoryModal';
import { ConnectionStatus } from './src/components/ConnectionStatus';
import { PreSaveEditModal } from './src/components/PreSaveEditModal';

// Importar tipos y configuración
import { AppState, ImageData, LocationData, PlateRecognitionResult, PlateData } from './src/types';
import { CONFIG, ERROR_MESSAGES } from './src/config';

export default function App() {
  const { isPhone, isTablet, isLandscape } = useResponsive();
  
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
      console.log('📸 [App] Estado de la imagen:', {
        hasImage: !!state.image,
        imageUri: state.image?.uri,
        imageType: typeof state.image?.uri,
        imageLength: state.image?.uri?.length
      });

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
    paddingHorizontal: getResponsiveValue(16, 24, 32),
    paddingTop: getResponsiveValue(36, 48, 60),
    paddingBottom: getResponsiveValue(16, 24, 32),
  },
  infoRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveValue(8, 12, 16),
    position: 'relative',
  },
  title: {
    fontSize: getResponsiveFontSize(22),
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
    padding: getResponsiveValue(8, 12, 16),
    borderRadius: getResponsiveValue(20, 24, 28),
    backgroundColor: '#e6f3ff',
    marginRight: getResponsiveValue(8, 12, 16),
    minWidth: getResponsiveValue(36, 44, 52),
    minHeight: getResponsiveValue(36, 44, 52),
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: getResponsiveFontSize(22),
    color: '#0056b3',
    fontWeight: 'bold',
  },
  infoButton: {
    padding: getResponsiveValue(8, 12, 16),
    borderRadius: getResponsiveValue(20, 24, 28),
    backgroundColor: '#e6f3ff',
    minWidth: getResponsiveValue(36, 44, 52),
    minHeight: getResponsiveValue(36, 44, 52),
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: getResponsiveFontSize(22),
    color: '#0056b3',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: getResponsiveFontSize(15),
    color: '#666',
    marginBottom: getResponsiveValue(18, 24, 30),
    textAlign: 'center',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: getResponsiveValue(400, 500, 600),
    marginBottom: getResponsiveValue(24, 32, 40),
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: getResponsiveValue(20, 28, 36),
  },
  loadingText: {
    marginTop: getResponsiveValue(10, 14, 18),
    fontSize: getResponsiveFontSize(16),
    color: '#333',
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: getResponsiveValue(400, 500, 600),
    alignItems: 'center',
    marginBottom: getResponsiveValue(18, 24, 30),
  },
  imageTitle: {
    fontSize: getResponsiveFontSize(16),
    fontWeight: 'bold',
    marginBottom: getResponsiveValue(8, 12, 16),
    color: '#333',
    textAlign: 'center',
  },
  image: {
    width: '100%',
    maxWidth: getResponsiveValue(340, 450, 560),
    height: getResponsiveValue(180, 240, 300),
    borderRadius: getResponsiveValue(12, 16, 20),
    borderWidth: getResponsiveValue(2, 3, 4),
    borderColor: '#ddd',
    marginBottom: getResponsiveValue(4, 6, 8),
  },
  errorContainer: {
    width: '100%',
    maxWidth: getResponsiveValue(400, 500, 600),
    backgroundColor: '#f8d7da',
    padding: getResponsiveValue(12, 16, 20),
    borderRadius: getResponsiveValue(8, 12, 16),
    borderWidth: 1,
    borderColor: '#f5c6cb',
    marginTop: getResponsiveValue(16, 20, 24),
  },
  errorText: {
    color: '#721c24',
    fontSize: getResponsiveFontSize(14),
    textAlign: 'center',
  },
});
