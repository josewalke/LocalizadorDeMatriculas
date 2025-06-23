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
} from 'react-native';

// Importar servicios y utilidades
import { PlateRecognizerService } from './src/services/plateRecognizer';
import { LocationService } from './src/services/locationService';
import { useImagePicker } from './src/hooks/useImagePicker';
import { useHistory } from './src/hooks/useHistory';

// Importar componentes
import { InfoModal } from './src/components/InfoModal';
import { PlateDisplay } from './src/components/PlateDisplay';
import { MapDisplay } from './src/components/MapDisplay';
import { HistoryModal } from './src/components/HistoryModal';

// Importar tipos y configuración
import { AppState, ImageData, LocationData, PlateRecognitionResult } from './src/types';
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
  
  const { pickImageFromGallery, takePhoto, isLoading: pickerLoading } = useImagePicker();
  const { 
    history, 
    isLoading: historyLoading, 
    addToHistory, 
    removeFromHistory, 
    clearHistory, 
    searchHistory 
  } = useHistory();

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

      // Añadir al historial
      if (locationData) {
        await addToHistory({
          plate: plateResult.plate,
          location: locationData,
          timestamp: Date.now(),
          confidence: plateResult.confidence,
        });
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

      <InfoModal 
        visible={showInfoModal} 
        onClose={() => setShowInfoModal(false)} 
      />

      <HistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        history={history}
        isLoading={historyLoading}
        onRemoveItem={removeFromHistory}
        onClearHistory={clearHistory}
        onSearch={searchHistory}
      />

      <Text style={styles.subtitle}>
        {isWeb ? 'Versión Web - Sube una foto de un coche' : 'Toma o selecciona una foto de un coche'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={isWeb ? 'Subir archivo' : 'Tomar foto'}
          onPress={isWeb ? handlePickImage : handleTakePhoto}
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
        <PlateDisplay plate={state.plate} />
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
});
