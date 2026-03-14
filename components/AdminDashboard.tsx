import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TrendingUp, DollarSign, ChevronRight, Users, BarChart2 } from 'lucide-react-native';
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

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {/* Revenue Card */}
        <LinearGradient
          colors={['#1B3A20', '#2D5A27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.statCard, styles.statCardLarge]}
        >
          <View style={styles.statIconBg}>
            <TrendingUp size={22} color="#fff" />
          </View>
          <Text style={styles.statLabelLight}>Lucro Total (Taxas)</Text>
          <Text style={styles.statValueLarge}>
            {faturamento !== null
              ? `R$ ${parseFloat(faturamento.toString()).toFixed(2).replace('.', ',')}`
              : '...'}
          </Text>
          <Text style={styles.statSubtext}>10% de todas as viagens</Text>
        </LinearGradient>

        {/* Trips Card */}
        <LinearGradient
          colors={['#E67E22', '#D35400']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.statCard}
        >
          <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <BarChart2 size={20} color="#fff" />
          </View>
          <Text style={styles.statLabelLight}>Viagens</Text>
          <Text style={styles.statValueMedium}>{viagens}</Text>
        </LinearGradient>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionLabel}>Ações Rápidas</Text>

      {/* Action Buttons */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/admin/dashboard')}
        style={styles.actionCard}
      >
        <View style={styles.actionIconWrapper}>
          <DollarSign size={20} color={theme.colors.primary} />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Relatório Financeiro</Text>
          <Text style={styles.actionSubtitle}>Ver taxas e receitas em detalhe</Text>
        </View>
        <ChevronRight size={20} color={theme.colors.gray} />
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/admin/approvals')}
      >
        <LinearGradient
          colors={['#1B3A20', '#2D5A27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.actionCardGradient}
        >
          <View style={[styles.actionIconWrapper, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Users size={20} color="#fff" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: '#fff' }]}>Aprovar Motoristas</Text>
            <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.65)' }]}>
              Revisar cadastros pendentes
            </Text>
          </View>
          <View style={styles.badgeRow}>
            {pendingCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingCount}</Text>
              </View>
            )}
            <ChevronRight size={20} color="rgba(255,255,255,0.7)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    gap: 6,
    elevation: 6,
    shadowColor: '#0F2417',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  statCardLarge: {
    flex: 1.6,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabelLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValueLarge: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  statValueMedium: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  statSubtext: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  actionCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    gap: 12,
    elevation: 6,
    shadowColor: '#0F2417',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  actionSubtitle: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
