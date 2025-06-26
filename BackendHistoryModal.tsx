import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { PlateResponse } from '../types';
import { apiService } from '../services/apiService';
import { MiniMap } from './MiniMap';
import { EditPlateModal } from './EditPlateModal';

interface BackendHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BackendHistoryModal: React.FC<BackendHistoryModalProps> = ({
  visible,
  onClose,
}) => {
  const [plates, setPlates] = useState<PlateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [editingPlate, setEditingPlate] = useState<PlateResponse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadPlates = async () => {
    setIsLoading(true);
    try {
      const platesFromBackend = await apiService.getPlates();
      setPlates(platesFromBackend);
    } catch (error) {
      console.error('Error cargando matrículas del backend:', error);
      Alert.alert('Error', 'No se pudieron cargar las matrículas del servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlate = async (id: number) => {
    console.log(`🗑️ [BackendHistoryModal] Botón de borrar presionado para ID: ${id}`);
    
    // Hacer el borrado más directo sin confirmación por ahora
    console.log(`🚀 [BackendHistoryModal] Iniciando borrado directo...`);
    
    try {
      console.log(`📞 [BackendHistoryModal] Llamando a apiService.deletePlate(${id})...`);
      await apiService.deletePlate(id);
      
      console.log(`🔄 [BackendHistoryModal] Recargando lista de matrículas...`);
      await loadPlates(); // Recargar la lista
      
      console.log(`✅ [BackendHistoryModal] Mostrando mensaje de éxito`);
      Alert.alert('Éxito', 'Matrícula eliminada correctamente');
    } catch (error) {
      console.error(`❌ [BackendHistoryModal] Error eliminando matrícula:`, error);
      Alert.alert('Error', 'No se pudo eliminar la matrícula');
    }
    
    // Versión con confirmación (comentada por ahora)
    /*
    Alert.alert(
      'Eliminar Matrícula',
      '¿Estás seguro de que quieres eliminar esta matrícula del servidor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            console.log(`✅ [BackendHistoryModal] Usuario confirmó borrado de ID: ${id}`);
            
            try {
              console.log(`📞 [BackendHistoryModal] Llamando a apiService.deletePlate(${id})...`);
              await apiService.deletePlate(id);
              
              console.log(`🔄 [BackendHistoryModal] Recargando lista de matrículas...`);
              await loadPlates(); // Recargar la lista
              
              console.log(`✅ [BackendHistoryModal] Mostrando mensaje de éxito`);
              Alert.alert('Éxito', 'Matrícula eliminada correctamente');
            } catch (error) {
              console.error(`❌ [BackendHistoryModal] Error eliminando matrícula:`, error);
              Alert.alert('Error', 'No se pudo eliminar la matrícula');
            }
          }
        },
      ]
    );
    */
  };

  const editPlate = (plate: PlateResponse) => {
    console.log(`✏️ [BackendHistoryModal] Abriendo edición para ID: ${plate.id}`);
    setEditingPlate(plate);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingPlate(null);
  };

  const handleEditUpdate = () => {
    loadPlates(); // Recargar la lista después de la edición
  };

  const toggleExpanded = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredPlates = plates.filter(plate =>
    plate.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderPlateItem = ({ item }: { item: PlateResponse }) => {
    const isExpanded = expandedItems.has(item.id);
    
    return (
      <View style={styles.plateItem}>
        <TouchableOpacity
          style={styles.itemHeader}
          onPress={() => toggleExpanded(item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerContent}>
            <Text style={styles.plateText}>{item.plate}</Text>
            <Text style={styles.dateText}>
              📅 {new Date(item.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
            {item.confidence && (
              <Text style={styles.confidenceText}>
                Confianza: {Math.round(item.confidence * 100)}%
              </Text>
            )}
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.expandIcon}>
              {isExpanded ? '▼' : '▶'}
            </Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editPlate(item)}
            >
              <Text style={styles.editButtonText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => {
                console.log(`👆 [BackendHistoryModal] Botón 🗑️ presionado para ID: ${item.id}`);
                deletePlate(item.id);
              }}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.expandedContent}>
            {item.image_filename && (
              <View style={styles.imageContainer}>
                <Text style={styles.imageTitle}>🚗 Imagen del vehículo:</Text>
                <Image 
                  source={{ uri: apiService.getImageUrl(item.image_filename) }}
                  style={styles.plateImage}
                  resizeMode="cover"
                />
              </View>
            )}
            
            <View style={styles.mapContainer}>
              <Text style={styles.mapTitle}>🗺️ Ubicación:</Text>
              <MiniMap location={{
                latitude: item.latitude,
                longitude: item.longitude,
                accuracy: item.accuracy,
                timestamp: new Date(item.created_at).getTime()
              }} />
            </View>
          </View>
        )}
      </View>
    );
  };

  useEffect(() => {
    if (visible) {
      loadPlates();
    }
  }, [visible]);

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Matrículas del Servidor</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar matrícula..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity style={styles.refreshButton} onPress={loadPlates}>
                <Text style={styles.refreshButtonText}>🔄 Actualizar</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007BFF" />
                <Text style={styles.loadingText}>Cargando matrículas...</Text>
              </View>
            ) : filteredPlates.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery ? 'No se encontraron matrículas' : 'No hay matrículas en el servidor'}
                </Text>
                <Text style={styles.emptySubtext}>
                  {searchQuery ? 'Intenta con otra búsqueda' : 'Las matrículas aparecerán aquí cuando las escanees'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredPlates}
                renderItem={renderPlateItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.platesList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>

      <EditPlateModal
        visible={showEditModal}
        plate={editingPlate}
        onClose={handleEditClose}
        onUpdate={handleEditUpdate}
      />
    </>
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
    borderRadius: 16,
    width: '100%',
    maxWidth: 700,
    maxHeight: '90%',
    padding: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 18,
  },
  actionsContainer: {
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#007BFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  platesList: {
    flex: 1,
  },
  plateItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#e6f3ff',
  },
  headerContent: {
    flex: 1,
  },
  plateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: '#888',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandIcon: {
    fontSize: 16,
    color: '#007BFF',
    marginRight: 12,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 6,
    marginRight: 8,
  },
  editButtonText: {
    fontSize: 18,
    color: '#007BFF',
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 18,
  },
  expandedContent: {
    padding: 16,
    backgroundColor: 'white',
  },
  imageContainer: {
    marginBottom: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  plateImage: {
    width: '100%',
    maxWidth: 300,
    height: 180,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  mapContainer: {
    marginTop: 12,
  },
  mapTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
}); 