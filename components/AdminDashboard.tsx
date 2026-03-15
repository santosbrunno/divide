import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { TrendingUp, DollarSign, ChevronRight, Users, BarChart2, Activity, ShieldCheck, PieChart } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import api from '../services/api';
import { useRouter } from 'expo-router';

export const AdminDashboard = () => {
  const router = useRouter();
  const [faturamento, setFaturamento] = useState<number | null>(null);
  const [viagens, setViagens] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchPendingCount();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/faturamento');
      setFaturamento(response.data.total_faturamento);
      setViagens(response.data.total_viagens);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      setFaturamento(0);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const response = await api.get('/admin/motoristas/pendentes');
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('Erro ao buscar pendentes:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Admin Status Header */}
      <View style={styles.statusHeader}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Sistema Online · Central de Controle</Text>
      </View>

      {/* Main Stats Card */}
      <LinearGradient
        colors={['#1B3A20', '#0F2417']}
        style={styles.mainCard}
      >
        <View style={styles.mainCardTop}>
          <View>
            <Text style={styles.mainLabel}>Faturamento Total</Text>
            <Text style={styles.mainValue}>
              {faturamento !== null
                ? `R$ ${parseFloat(faturamento.toString()).toFixed(2).replace('.', ',')}`
                : 'R$ 0,00'}
            </Text>
          </View>
          <View style={styles.mainIconWrapper}>
            <DollarSign size={24} color="#D4AF37" />
          </View>
        </View>
        <View style={styles.mainCardBottom}>
          <Activity size={14} color="#4ADE80" />
          <Text style={styles.mainTrend}>+ 12.5% em relação ao mês anterior</Text>
        </View>
      </LinearGradient>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.miniCard}>
          <View style={[styles.miniIconBg, { backgroundColor: 'rgba(230,126,34,0.1)' }]}>
            <BarChart2 size={18} color="#E67E22" />
          </View>
          <Text style={styles.miniValue}>{viagens}</Text>
          <Text style={styles.miniLabel}>Viagens</Text>
        </View>

        <View style={styles.miniCard}>
          <View style={[styles.miniIconBg, { backgroundColor: 'rgba(74,222,128,0.1)' }]}>
            <Users size={18} color="#4ADE80" />
          </View>
          <Text style={styles.miniValue}>152</Text>
          <Text style={styles.miniLabel}>Usuários</Text>
        </View>
      </View>

      {/* Actions */}
      <Text style={styles.sectionLabel}>Gestão de Plataforma</Text>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/admin/approvals')}
        style={styles.actionItem}
      >
        <LinearGradient colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']} style={styles.actionInner}>
          <View style={[styles.actionIconBg, { backgroundColor: pendingCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)' }]}>
             <ShieldCheck size={20} color={pendingCount > 0 ? '#F87171' : 'rgba(255,255,255,0.6)'} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Aprovar Motoristas</Text>
            <Text style={styles.actionSub}>Analisar novos cadastros da fila</Text>
          </View>
          {pendingCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingCount}</Text>
            </View>
          )}
          <ChevronRight size={18} color="rgba(255,255,255,0.2)" />
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/admin/dashboard')}
        style={styles.actionItem}
      >
        <LinearGradient colors={['#E67E22', '#D35400']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.actionInner}>
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
             <PieChart size={20} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: '#fff' }]}>Relatório Financeiro</Text>
            <Text style={[styles.actionSub, { color: 'rgba(255,255,255,0.7)' }]}>Ver transações e taxas detalhadas</Text>
          </View>
          <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80' },
  statusText: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  
  mainCard: {
    borderRadius: 24, padding: 24, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3, shadowRadius: 20,
  },
  mainCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mainLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '600' },
  mainValue: { color: '#fff', fontSize: 28, fontWeight: '900', marginTop: 4 },
  mainIconWrapper: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  mainCardBottom: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 20 },
  mainTrend: { color: '#4ADE80', fontSize: 12, fontWeight: '600' },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  miniCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20,
    padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  miniIconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  miniValue: { color: '#fff', fontSize: 20, fontWeight: '900' },
  miniLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600' },

  sectionLabel: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  
  actionItem: { marginBottom: 12 },
  actionInner: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 20, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  actionIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionContent: { flex: 1 },
  actionTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
  actionSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  
  badge: { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginRight: 4 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },
});
