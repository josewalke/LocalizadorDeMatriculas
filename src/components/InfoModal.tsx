import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Información</Text>
          <Text style={styles.modalText}>
            Esta aplicación reconoce matrículas de vehículos y muestra la ubicación donde se tomó la foto.
          </Text>
          <Text style={styles.modalText}>
            Para obtener la ubicación real de la foto:
          </Text>
          <Text style={styles.modalText}>
            • Usa fotos originales en formato JPG/JPEG
          </Text>
          <Text style={styles.modalText}>
            • No envíes las fotos por WhatsApp (pierde metadatos GPS)
          </Text>
          <Text style={styles.modalText}>
            • Transfiere directamente desde tu móvil al PC
          </Text>
          <Text style={styles.modalText}>
            • Asegúrate de que el GPS esté activado al tomar la foto
          </Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={onClose}
          >
            <Text style={styles.modalButtonText}>Entendido</Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'left',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 