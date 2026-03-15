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
import { Check, X, Mail, CreditCard, Car, ChevronLeft, Clock, ShieldCheck, UserCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
    <LinearGradient
      colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <LinearGradient colors={['#E67E22', '#D35400']} style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.nome)}</Text>
        </LinearGradient>
        <View style={styles.driverInfo}>
          <Text style={styles.driverName}>{item.nome}</Text>
          <View style={styles.emailRow}>
            <Mail size={12} color="rgba(255,255,255,0.3)" />
            <Text style={styles.driverEmail}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.pendingBadge}>
          <Clock size={11} color="#E67E22" />
          <Text style={styles.pendingBadgeText}>Pendente</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailChip}>
          <CreditCard size={13} color="#E67E22" />
          <Text style={styles.detailLabel}>DOCS</Text>
          <Text style={styles.detailValue}>CPF: {item.cpf}</Text>
        </View>
        <View style={styles.detailChip}>
          <UserCheck size={13} color="#4ADE80" />
          <Text style={styles.detailLabel}>CNH</Text>
          <Text style={styles.detailValue}>{item.cnh}</Text>
        </View>
      </View>

      {item.model && (
        <View style={styles.vehicleCard}>
          <Car size={16} color="#E67E22" />
          <Text style={styles.vehicleText}>
            {item.brand} {item.model} · {item.plate}
          </Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.rejectBtn}
          onPress={() => handleUpdateStatus(item.user_id, 'rejeitado')}
        >
          <X size={18} color="#FF6B6B" />
          <Text style={styles.rejectText}>Rejeitar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.approveBtn}
          onPress={() => handleUpdateStatus(item.user_id, 'aprovado')}
        >
          <LinearGradient colors={['#2D5A27', '#1B3A20']} style={styles.approveBtnGrad}>
            <Check size={18} color="#fff" />
            <Text style={styles.approveText}>Aprovar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1A0D" />
      <LinearGradient colors={['#0A1A0D', '#0F2417']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View>
                <Text style={styles.headerTitle}>Verificação</Text>
                <Text style={styles.headerSub}>{drivers.length} motoristas na fila</Text>
            </View>
            <View style={styles.headerIcon}>
                <ShieldCheck size={28} color="rgba(255,255,255,0.15)" />
            </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#E67E22" />
          </View>
        ) : (
          <FlatList
            data={drivers}
            renderItem={renderDriverCard}
            keyExtractor={(item) => item.user_id.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Check size={48} color="#4ADE80" style={{opacity: 0.3}} />
                <Text style={styles.emptyTitle}>Tudo em ordem!</Text>
                <Text style={styles.emptySub}>Não há motoristas aguardando aprovação.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1A0D' },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, 
    paddingVertical: 20, gap: 16, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  headerSub: { color: '#E67E22', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  headerIcon: { flex: 1, alignItems: 'flex-end' },

  list: { padding: 20 },
  card: { 
    borderRadius: 24, padding: 20, marginBottom: 16, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' 
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '900' },
  driverInfo: { flex: 1 },
  driverName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  driverEmail: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  pendingBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, 
    backgroundColor: 'rgba(230,126,34,0.1)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 
  },
  pendingBadgeText: { color: '#E67E22', fontSize: 10, fontWeight: '800' },

  detailsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  detailChip: { 
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14, 
    padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' 
  },
  detailLabel: { color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: '800', marginBottom: 4 },
  detailValue: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700' },

  vehicleCard: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    backgroundColor: 'rgba(46,90,39,0.15)', padding: 12, borderRadius: 12, marginBottom: 20 
  },
  vehicleText: { color: '#4ADE80', fontSize: 13, fontWeight: '700' },

  actions: { flexDirection: 'row', gap: 12 },
  rejectBtn: { 
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 8, paddingVertical: 14, borderRadius: 16, borderWidth: 1.5, borderColor: 'rgba(255,107,107,0.2)' 
  },
  rejectText: { color: '#FF6B6B', fontWeight: '800', fontSize: 14 },
  approveBtn: { flex: 1.5, borderRadius: 16, overflow: 'hidden' },
  approveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  approveText: { color: '#fff', fontWeight: '800', fontSize: 14 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 60, alignItems: 'center', gap: 16 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  emptySub: { color: 'rgba(255,255,255,0.3)', textAlign: 'center', fontSize: 14 },
});
