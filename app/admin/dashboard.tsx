import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TrendingUp, Users, MapPin, DollarSign } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import api from '../../services/api';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [faturamento, setFaturamento] = useState<number>(0);

  useEffect(() => {
    fetchFaturamento();
  }, []);

  const fetchFaturamento = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/faturamento');
      setFaturamento(response.data.total_faturamento);
    } catch (error) {
      console.error('Erro ao buscar faturamento:', error);
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.title}>Relatório de Lucros</Text>
      
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TrendingUp size={20} color={theme.colors.secondary} />
          <Text style={styles.cardTitle}>Geral</Text>
        </View>
        <Text style={styles.bigValue}>R$ {parseFloat(faturamento.toString()).toFixed(2).replace('.', ',')}</Text>
        <Text style={styles.label}>Lucro líquido das taxas (10%)</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.smallCard}>
          <Users size={18} color={theme.colors.primary} />
          <Text style={styles.smallValue}>124</Text>
          <Text style={styles.smallLabel}>Novos Usuários</Text>
        </View>
        <View style={styles.smallCard}>
          <MapPin size={18} color={theme.colors.primary} />
          <Text style={styles.smallValue}>Santa Catarina</Text>
          <Text style={styles.smallLabel}>Região Ativa</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Últimas Taxas Recebidas</Text>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.listItem}>
            <View style={styles.itemIcon}>
              <DollarSign size={16} color={theme.colors.secondary} />
            </View>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>Taxa Viagem #{1024 + i}</Text>
              <Text style={styles.itemSubtitle}>Pomerode → Blumenau</Text>
            </View>
            <Text style={styles.itemValue}>+ R$ {(Math.random() * 5 + 2).toFixed(2)}</Text>
          </View>
        ))}
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
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
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
