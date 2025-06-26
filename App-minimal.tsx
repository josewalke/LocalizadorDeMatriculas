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
  SafeAreaView,
} from 'react-native';

// Configuración mínima
const CONFIG = {
  APP: {
    NAME: 'Localizador de Matrículas',
  },
  BACKEND: {
    BASE_URL: 'http://192.168.1.131:3001/api',
  },
};

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [plate, setPlate] = useState<string | null>(null);

  const handleTakePhoto = () => {
    Alert.alert(
      'Función de Cámara',
      'Esta es una versión de demostración. La funcionalidad completa estará disponible en la versión final.',
      [{ text: 'OK' }]
    );
  };

  const handlePickImage = () => {
    Alert.alert(
      'Galería',
      'Esta es una versión de demostración. La funcionalidad completa estará disponible en la versión final.',
      [{ text: 'OK' }]
    );
  };

  const handleHistory = () => {
    Alert.alert(
      'Historial',
      'Esta es una versión de demostración. El historial estará disponible en la versión final.',
      [{ text: 'OK' }]
    );
  };

  const handleInfo = () => {
    Alert.alert(
      'Información',
      'Localizador de Matrículas\n\nEsta aplicación reconoce matrículas de vehículos y muestra la ubicación donde se tomó la foto.\n\nVersión de demostración - Funcionalidad completa próximamente.',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.title}>{CONFIG.APP.NAME}</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleHistory}
          >
            <Text style={styles.historyButtonText}>📋</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.infoButton}
            onPress={handleInfo}
          >
            <Text style={styles.infoButtonText}>ℹ️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.connectionStatus}>
        <Text style={styles.connectionText}>🔴 Desconectado</Text>
        <Text style={styles.connectionSubtext}>Versión de demostración</Text>
      </View>

      <Text style={styles.subtitle}>
        {Platform.OS === 'web' ? 'Versión Web - Sube una foto de un coche' : 'Toma o selecciona una foto de un coche'}
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title={Platform.OS === 'web' ? 'Subir archivo' : 'Tomar foto'}
          onPress={handleTakePhoto}
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

      <View style={styles.demoContainer}>
        <Text style={styles.demoTitle}>🎯 Versión de Demostración</Text>
        <Text style={styles.demoText}>
          Esta es una versión simplificada para verificar que el build funciona correctamente.
        </Text>
        <Text style={styles.demoText}>
          La funcionalidad completa incluirá:
        </Text>
        <Text style={styles.demoFeature}>• Reconocimiento de matrículas</Text>
        <Text style={styles.demoFeature}>• Geolocalización GPS</Text>
        <Text style={styles.demoFeature}>• Historial completo</Text>
        <Text style={styles.demoFeature}>• Conexión al backend</Text>
        <Text style={styles.demoFeature}>• Edición de matrículas</Text>
      </View>
    </SafeAreaView>
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
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
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
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoButtonText: {
    fontSize: 22,
    color: '#0056b3',
    fontWeight: 'bold',
  },
  connectionStatus: {
    width: '100%',
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffeaa7',
    marginBottom: 16,
    alignItems: 'center',
  },
  connectionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  connectionSubtext: {
    fontSize: 14,
    color: '#856404',
    marginTop: 4,
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
  demoContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#e8f4fd',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bee5eb',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c5460',
    textAlign: 'center',
    marginBottom: 12,
  },
  demoText: {
    fontSize: 14,
    color: '#0c5460',
    marginBottom: 8,
    textAlign: 'center',
  },
  demoFeature: {
    fontSize: 14,
    color: '#0c5460',
    marginBottom: 4,
    paddingLeft: 16,
  },
}); 