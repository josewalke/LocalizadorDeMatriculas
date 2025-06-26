import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { PlateRecognitionResult } from '../types';

interface PlateDisplayProps {
  plate: PlateRecognitionResult;
}

export const PlateDisplay: React.FC<PlateDisplayProps> = ({ plate }) => {
  return (
    <View style={styles.plateContainer}>
      <Text style={styles.plateTitle}>Matrícula Reconocida:</Text>
      <Text style={styles.plateText}>{plate.plate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  plateContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#E6F3FF',
    padding: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007BFF',
    alignItems: 'center',
    marginBottom: 18,
  },
  plateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#0056b3',
    textAlign: 'center',
  },
  plateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004085',
    letterSpacing: 3,
    textAlign: 'center',
  },
}); 