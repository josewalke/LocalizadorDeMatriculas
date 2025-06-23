import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { LocationData, PlateRecognitionResult } from '../types';
import { LocationService } from '../services/locationService';

interface MapDisplayProps {
  location: LocationData;
  plate: PlateRecognitionResult;
}

export const MapDisplay: React.FC<MapDisplayProps> = ({ location, plate }) => {
  const isWeb = Platform.OS === 'web';

  if (isWeb) {
    // Para web, usar OpenStreetMap (gratuito, sin API key)
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`;
    
    return (
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>Ubicación en el mapa:</Text>
        <iframe
          src={mapUrl}
          width="100%"
          height="220"
          style={{ border: 0, borderRadius: 8 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <Text style={styles.mapInfo}>Matrícula: {plate.plate}</Text>
        <Text style={styles.coordinatesText}>
          Coordenadas: {LocationService.formatCoordinates(location.latitude, location.longitude)}
        </Text>
      </View>
    );
  } else {
    // Para móvil, mostrar información de coordenadas
    return (
      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>Ubicación detectada:</Text>
        <View style={styles.mobileMapPlaceholder}>
          <Text style={styles.mobileMapText}>
            📍 Lat: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.mobileMapText}>
            📍 Lon: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.mobileMapText}>
            🚗 Matrícula: {plate.plate}
          </Text>
          {location.accuracy && (
            <Text style={styles.accuracyText}>
              📏 Precisión: ±{Math.round(location.accuracy)}m
            </Text>
          )}
        </View>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    maxWidth: 400,
    height: 220,
    marginBottom: 18,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#007BFF',
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#0056b3',
    textAlign: 'center',
  },
  mapInfo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0056b3',
    marginTop: 8,
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  mobileMapPlaceholder: {
    width: '100%',
    padding: 20,
    alignItems: 'center',
  },
  mobileMapText: {
    fontSize: 16,
    color: '#0056b3',
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  accuracyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
}); 