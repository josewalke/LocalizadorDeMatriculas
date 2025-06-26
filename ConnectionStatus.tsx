import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { BackendConnectionState } from '../hooks/useBackendConnection';

interface ConnectionStatusProps {
  connectionState: BackendConnectionState;
  onRetry: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  onRetry,
}) => {
  const { isConnected, isLoading, error, lastChecked } = connectionState;

  const getStatusColor = () => {
    if (isLoading) return '#007BFF';
    if (isConnected) return '#28a745';
    return '#dc3545';
  };

  const getStatusText = () => {
    if (isLoading) return 'Verificando conexión...';
    if (isConnected) return 'Conectado';
    return 'Desconectado';
  };

  const getStatusIcon = () => {
    if (isLoading) return '⏳';
    if (isConnected) return '✅';
    return '❌';
  };

  const formatLastChecked = () => {
    if (!lastChecked) return '';
    return `Última verificación: ${lastChecked.toLocaleTimeString()}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        )}
      </View>
      
      <View style={styles.statusInfo}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
        {lastChecked && (
          <Text style={styles.lastCheckedText}>{formatLastChecked()}</Text>
        )}
        {error && !isLoading && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>

      {!isConnected && !isLoading && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 16,
    width: '100%',
    maxWidth: 400,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIcon: {
    fontSize: 14,
    color: 'white',
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  lastCheckedText: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 2,
  },
  retryButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 