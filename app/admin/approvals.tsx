import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Check, X, User, Mail, CreditCard, Car } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import api from '../../services/api';

interface PendingDriver {
  user_id: number;
  nome: string;
  email: string;
  cpf: string;
  cnh: string;
  brand?: string;
  model?: string;
  plate?: string;
  color?: string;
  created_at: string;
}

export default function DriverApprovalScreen() {
  const [drivers, setDrivers] = useState<PendingDriver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const fetchPendingDrivers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/motoristas/pendentes');
      setDrivers(response.data);
    } catch (error) {
      console.error('Erro ao buscar motoristas:', error);
      Alert.alert('Erro', 'Não foi possível carregar a lista de motoristas.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'aprovado' | 'rejeitado') => {
    const actionLabel = status === 'aprovado' ? 'aprovar' : 'rejeitar';
    
    Alert.alert(
      'Confirmar Ação',
      `Deseja realmente ${actionLabel} este motorista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          onPress: async () => {
            try {
              await api.patch(`/admin/motoristas/${id}/status`, { status });
              Alert.alert('Sucesso', `Motorista ${status} com sucesso!`);
              fetchPendingDrivers();
            } catch (error) {
              console.error('Erro ao atualizar status:', error);
              Alert.alert('Erro', 'Falha ao atualizar o status.');
            }
          }
        }
      ]
    );
  };

  const renderDriverCard = ({ item }: { item: PendingDriver }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <User size={16} color={theme.colors.primary} />
          <Text style={styles.driverName}>{item.nome}</Text>
        </View>
        <View style={styles.infoRow}>
          <Mail size={14} color={theme.colors.gray} />
          <Text style={styles.driverSubText}>{item.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <CreditCard size={14} color={theme.colors.gray} />
          <Text style={styles.driverSubText}>CPF: {item.cpf}</Text>
        </View>
        <View style={styles.infoRow}>
          <CreditCard size={14} color={theme.colors.secondary} />
          <Text style={styles.driverSubText}>CNH: {item.cnh}</Text>
        </View>
        {item.model && (
          <View style={[styles.infoRow, { marginTop: 4, padding: 8, backgroundColor: '#F5F5F5', borderRadius: 8 }]}>
            <Car size={16} color={theme.colors.primary} />
            <Text style={{ fontWeight: '600', fontSize: 13 }}>{item.brand} {item.model} • {item.plate} ({item.color})</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]} 
          onPress={() => handleUpdateStatus(item.user_id, 'aprovado')}
        >
          <Check size={20} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]} 
          onPress={() => handleUpdateStatus(item.user_id, 'rejeitado')}
        >
          <X size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Motoristas Pendentes</Text>
      <FlatList
        data={drivers}
        renderItem={renderDriverCard}
        keyExtractor={(item) => item.user_id.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Não há motoristas aguardando aprovação.</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  driverSubText: {
    fontSize: 13,
    color: theme.colors.gray,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: 16,
  },
});
