import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
          
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>📱 Funcionalidades</Text>
            <Text style={styles.modalText}>
              Esta aplicación reconoce matrículas de vehículos y muestra la ubicación donde se tomó la foto.
            </Text>
            
            <Text style={styles.sectionTitle}>📍 Ubicación GPS</Text>
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
            
            <Text style={styles.sectionTitle}>☁️ Conexión al Backend</Text>
            <Text style={styles.modalText}>
              La aplicación se conecta a un servidor local para sincronizar datos:
            </Text>
            <Text style={styles.modalText}>
              • Servidor: 192.168.1.100:3001
            </Text>
            <Text style={styles.modalText}>
              • Verificación automática cada 30 segundos
            </Text>
            <Text style={styles.modalText}>
              • Historial compartido entre dispositivos
            </Text>
            
            <Text style={styles.sectionTitle}>🔧 Solución de Problemas</Text>
            <Text style={styles.modalText}>
              Si aparece "Desconectado":
            </Text>
            <Text style={styles.modalText}>
              • Verifica que el backend esté corriendo
            </Text>
            <Text style={styles.modalText}>
              • Asegúrate de estar en la misma red WiFi
            </Text>
            <Text style={styles.modalText}>
              • Comprueba que el firewall permita conexiones
            </Text>
            <Text style={styles.modalText}>
              • Usa el botón "Reintentar" para verificar conexión
            </Text>
          </ScrollView>
          
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
    maxHeight: '80%',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007BFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'left',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    textAlign: 'left',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 