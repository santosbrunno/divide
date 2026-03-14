import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
} from 'react-native';
import { TrendingUp, DollarSign, ChevronRight } from 'lucide-react-native';
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
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Dashboard Administrativo</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            style={styles.iconCircle}
          >
            <TrendingUp size={24} color={theme.colors.primary} />
          </LinearGradient>
          <Text style={styles.statValue}>
            {faturamento !== null 
              ? `R$ ${parseFloat(faturamento.toString()).toFixed(2).replace('.', ',')}` 
              : '...'}
          </Text>
          <Text style={styles.statLabel}>Lucro (Taxas)</Text>
        </View>
        <View style={styles.statCard}>
          <LinearGradient
            colors={['#FFF3E0', '#FFE0B2']}
            style={styles.iconCircle}
          >
            <DollarSign size={24} color={theme.colors.secondary} />
          </LinearGradient>
          <Text style={styles.statValue}>{viagens}</Text>
          <Text style={styles.statLabel}>Viagens</Text>
        </View>
      </View>
      
      <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/admin/dashboard')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={styles.actionButtonText}>Relatório Financeiro</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/admin/approvals')}
          >
            <LinearGradient
                colors={theme.gradients.action as [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.actionButton, { borderWidth: 0 }]}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Text style={[styles.actionButtonText, { color: theme.colors.white }]}>
                    Aprovar Motoristas
                </Text>
                {pendingCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{pendingCount}</Text>
                    </View>
                )}
                </View>
                <ChevronRight size={20} color={theme.colors.white} />
            </LinearGradient>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    elevation: 4,
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    alignItems: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  actionsContainer: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: 18,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  actionButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  badge: {
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
