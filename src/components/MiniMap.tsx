import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { LocationData } from '../types';

interface MiniMapProps {
  location: LocationData;
}

export const MiniMap: React.FC<MiniMapProps> = ({ location }) => {
  if (Platform.OS === 'web') {
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`;
    return (
      <View style={styles.mapContainer}>
        <iframe
          src={mapUrl}
          width="100%"
          height="220"
          style={{ border: 0, borderRadius: 12 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </View>
    );
  } else {
    // En móvil, solo mostramos un placeholder
    return (
      <View style={styles.mapContainer}>
        <Text style={styles.mapPlaceholderText}>Mapa no disponible en móvil</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#007BFF',
    backgroundColor: '#e6f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mapPlaceholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 