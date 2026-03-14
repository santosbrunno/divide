import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { TrendingUp, Users, MapPin, DollarSign, LogOut } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useRole } from '../../context/RoleContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, setRole, setUser } = useRole();
  const [loading, setLoading] = useState(true);
  const [faturamento, setFaturamento] = useState<number>(0);
  const [taxas, setTaxas] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, regions: 'Santa Catarina' });

  useEffect(() => {
    fetchFaturamento();
  }, []);

  const fetchFaturamento = async () => {
    try {
      setLoading(true);
      const [faturamentoRes, taxasRes, pendentesRes] = await Promise.all([
        api.get('/admin/faturamento'),
        api.get('/admin/taxas-recentes'),
        api.get('/admin/motoristas/pendentes')
      ]);
      
      setFaturamento(faturamentoRes.data.total_faturamento);
      setTaxas(taxasRes.data);
      setStats(prev => ({ ...prev, users: pendentesRes.data.length }));
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setRole('passenger');
    setUser(null);
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Painel de Controle</Text>
          <Text style={styles.subtitle}>Olá, {user?.nome || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Relatório de Lucros</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TrendingUp size={20} color={theme.colors.secondary} />
          <Text style={styles.cardTitle}>Geral</Text>
        </View>
        <Text style={styles.bigValue}>R$ {parseFloat(faturamento.toString()).toFixed(2).replace('.', ',')}</Text>
        <Text style={styles.label}>Lucro líquido das taxas (10%)</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity 
          style={styles.smallCard}
          onPress={() => router.push('/admin/approvals')}
        >
          <Users size={18} color={theme.colors.primary} />
          <Text style={styles.smallValue}>Aprovar</Text>
          <Text style={styles.smallLabel}>Motoristas</Text>
        </TouchableOpacity>
        <View style={styles.smallCard}>
          <MapPin size={18} color={theme.colors.primary} />
          <Text style={styles.smallValue}>Santa Catarina</Text>
          <Text style={styles.smallLabel}>Região Ativa</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas Taxas Recebidas</Text>
        {taxas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma taxa recebida ainda.</Text>
        ) : (
          taxas.map((item) => (
            <View key={item.booking_id} style={styles.listItem}>
              <View style={styles.itemIcon}>
                <DollarSign size={16} color={theme.colors.secondary} />
              </View>
              <View style={styles.itemContent}>
                <Text style={styles.itemTitle}>{item.passageiro}</Text>
                <Text style={styles.itemSubtitle}>{item.origin_city} → {item.destination_city}</Text>
              </View>
              <Text style={styles.itemValue}>+ R$ {parseFloat(item.taxa_plataforma).toFixed(2).replace('.', ',')}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.gray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.gray,
    marginTop: 20,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  bigValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  label: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  smallCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    elevation: 2,
    alignItems: 'center',
  },
  smallValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  smallLabel: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  section: {
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  itemValue: {
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
});
