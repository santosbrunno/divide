import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Check, X, User, Mail, CreditCard, Car, ChevronLeft, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
  const router = useRouter();

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
    const emoji = status === 'aprovado' ? '✅' : '❌';
    const label = status === 'aprovado' ? 'aprovar' : 'rejeitar';

    Alert.alert(
      `${emoji} Confirmar Ação`,
      `Deseja realmente ${label} este motorista?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await api.patch(`/admin/motoristas/${id}/status`, { status });
              Alert.alert('Concluído', `Motorista ${status} com sucesso!`);
              fetchPendingDrivers();
            } catch (error) {
              Alert.alert('Erro', 'Falha ao atualizar o status.');
            }
          },
        },
      ]
    );
  };

  const getInitials = (nome: string) =>
    nome.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const renderDriverCard = ({ item }: { item: PendingDriver }) => (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <LinearGradient
          colors={['#1B3A20', '#2D5A27']}
          style={styles.driverAvatar}
        >
          <Text style={styles.driverAvatarText}>{getInitials(item.nome)}</Text>
        </LinearGradient>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.nome}</Text>
          <View style={styles.infoRow}>
            <Mail size={12} color={theme.colors.gray} />
            <Text style={styles.driverEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.pendingBadge}>
          <Clock size={11} color="#E65100" />
          <Text style={styles.pendingBadgeText}>Pendente</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsGrid}>
        <View style={styles.detailChip}>
          <CreditCard size={13} color={theme.colors.primary} />
          <Text style={styles.detailLabel}>CPF</Text>
          <Text style={styles.detailValue}>{item.cpf}</Text>
        </View>
        <View style={styles.detailChip}>
          <CreditCard size={13} color={theme.colors.secondary} />
          <Text style={styles.detailLabel}>CNH</Text>
          <Text style={styles.detailValue}>{item.cnh}</Text>
        </View>
      </View>

      {/* Vehicle */}
      {item.model && (
        <View style={styles.vehicleCard}>
          <Car size={16} color={theme.colors.primary} />
          <Text style={styles.vehicleText}>
            {item.brand} {item.model} · {item.plate}
            {item.color ? ` · ${item.color}` : ''}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectButton}
          activeOpacity={0.8}
          onPress={() => handleUpdateStatus(item.user_id, 'rejeitado')}
        >
          <X size={18} color="#fff" />
          <Text style={styles.rejectButtonText}>Rejeitar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleUpdateStatus(item.user_id, 'aprovado')}
          style={styles.approveButtonOuter}
        >
          <LinearGradient
            colors={['#2D5A27', '#4A7C3A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.approveButton}
          >
            <Check size={18} color="#fff" />
            <Text style={styles.approveButtonText}>Aprovar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={['#0F2417', '#2D5A27']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Aprovar Motoristas</Text>
          {!loading && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{drivers.length} pendentes</Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando motoristas...</Text>
        </View>
      ) : (
        <FlatList
          data={drivers}
          renderItem={renderDriverCard}
          keyExtractor={(item) => item.user_id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>✅</Text>
              <Text style={styles.emptyTitle}>Tudo em dia!</Text>
              <Text style={styles.emptyText}>Não há motoristas aguardando aprovação.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  headerBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  driverInfo: {
    flex: 1,
    gap: 4,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverEmail: {
    fontSize: 13,
    color: theme.colors.gray,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  pendingBadgeText: {
    color: '#E65100',
    fontSize: 11,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingTop: 12,
  },
  detailChip: {
    flex: 1,
    backgroundColor: '#F5F7F6',
    borderRadius: 10,
    padding: 10,
    gap: 2,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 10,
    color: theme.colors.gray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    marginTop: 4,
  },
  detailValue: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: '700',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 14,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 10,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    paddingTop: 0,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F44336',
    elevation: 2,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  rejectButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  approveButtonOuter: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  approveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.gray,
    fontSize: 14,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: 14,
    textAlign: 'center',
  },
});
