import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrendingUp, Users, MapPin, DollarSign, LogOut, BarChart2, ChevronRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useRole } from '../../context/RoleContext';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, setRole, setUser } = useRole();
  const [loading, setLoading] = useState(true);
  const [faturamento, setFaturamento] = useState<number>(0);
  const [viagens, setViagens] = useState<number>(0);
  const [taxas, setTaxas] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [faturamentoRes, taxasRes, pendentesRes] = await Promise.all([
        api.get('/admin/faturamento'),
        api.get('/admin/taxas-recentes'),
        api.get('/admin/motoristas/pendentes'),
      ]);
      setFaturamento(faturamentoRes.data.total_faturamento);
      setViagens(faturamentoRes.data.total_viagens || 0);
      setTaxas(taxasRes.data);
      setPendingCount(pendentesRes.data.length);
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
        <Text style={styles.loadingText}>Carregando painel...</Text>
      </View>
    );
  }

  const initials = user?.nome
    ? user.nome.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'A';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#0F2417', '#1B3A20', '#2D5A27']} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.adminAvatar}>
              <Text style={styles.adminAvatarText}>{initials}</Text>
            </View>
            <View>
              <Text style={styles.welcomeLabel}>Painel de Controle</Text>
              <Text style={styles.welcomeName}>Olá, {user?.nome?.split(' ')[0] || 'Admin'} 👋</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Image
              source={require('../../assets/images/divide_logo.png')}
              style={styles.logoSmall}
              resizeMode="contain"
            />
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Revenue Main Card */}
            <LinearGradient
              colors={['#E67E22', '#D35400']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.statCard, styles.statCardMain]}
            >
              <View style={styles.statIcon}>
                <TrendingUp size={20} color="#fff" />
              </View>
              <Text style={styles.statLabelLight}>Lucro Total</Text>
              <Text style={styles.statMainValue}>
                R$ {parseFloat(faturamento.toString()).toFixed(2).replace('.', ',')}
              </Text>
              <Text style={styles.statSub}>10% das viagens</Text>
            </LinearGradient>

            <View style={styles.statColumnRight}>
              {/* Trips */}
              <LinearGradient
                colors={['#1B3A20', '#2D5A27']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCardSmall}
              >
                <BarChart2 size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.statSmallValue}>{viagens}</Text>
                <Text style={styles.statSmallLabel}>Viagens</Text>
              </LinearGradient>

              {/* Pending */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/admin/approvals')}
              >
                <LinearGradient
                  colors={pendingCount > 0 ? ['#c0392b', '#922b21'] : ['#34495e', '#2c3e50']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statCardSmall}
                >
                  <Users size={16} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.statSmallValue}>{pendingCount}</Text>
                  <Text style={styles.statSmallLabel}>Pendentes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/admin/approvals')}
          >
            <LinearGradient
              colors={['#1B3A20', '#2D5A27']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.quickActionCard}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Users size={20} color="#fff" />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={[styles.quickActionTitle, { color: '#fff' }]}>Aprovar Motoristas</Text>
                <Text style={[styles.quickActionSub, { color: 'rgba(255,255,255,0.6)' }]}>
                  {pendingCount > 0 ? `${pendingCount} aguardando análise` : 'Nenhum pendente'}
                </Text>
              </View>
              {pendingCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{pendingCount}</Text>
                </View>
              )}
              <ChevronRight size={20} color="rgba(255,255,255,0.5)" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.quickActionCard2}>
            <View style={styles.quickActionIcon2}>
              <MapPin size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Região Ativa</Text>
              <Text style={styles.quickActionSub}>Santa Catarina · Brasil</Text>
            </View>
          </View>

          {/* Recent Taxes */}
          <Text style={styles.sectionTitle}>Últimas Taxas Recebidas</Text>

          {taxas.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyEmoji}>💰</Text>
              <Text style={styles.emptyText}>Nenhuma taxa recebida ainda.</Text>
            </View>
          ) : (
            <View style={styles.taxasList}>
              {taxas.map((item, index) => (
                <View key={item.booking_id} style={styles.taxaItem}>
                  <View style={styles.taxaIcon}>
                    <DollarSign size={15} color={theme.colors.secondary} />
                  </View>
                  <View style={styles.taxaInfo}>
                    <Text style={styles.taxaPassenger}>{item.passageiro}</Text>
                    <Text style={styles.taxaRoute}>
                      {item.origin_city} → {item.destination_city}
                    </Text>
                  </View>
                  <Text style={styles.taxaValue}>
                    + R$ {parseFloat(item.taxa_plataforma).toFixed(2).replace('.', ',')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F5F7F6',
  },
  loadingText: {
    color: theme.colors.gray,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  adminAvatarText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  welcomeLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  logoSmall: {
    width: 70,
    height: 36,
    opacity: 0.7,
  },
  logoutButton: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  content: {
    padding: 16,
    marginTop: -8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 20,
    padding: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  statCardMain: {
    flex: 1.5,
    gap: 4,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabelLight: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statMainValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  statSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
  },
  statColumnRight: {
    flex: 1,
    gap: 12,
  },
  statCardSmall: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
    gap: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statSmallValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  statSmallLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 10,
    gap: 12,
    elevation: 6,
    shadowColor: '#0F2417',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  quickActionCard2: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    marginBottom: 20,
    gap: 12,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionIcon2: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  quickActionSub: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 26,
    height: 26,
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
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: 14,
  },
  taxasList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: 20,
  },
  taxaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F1',
    gap: 12,
  },
  taxaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taxaInfo: {
    flex: 1,
  },
  taxaPassenger: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
  },
  taxaRoute: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  taxaValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.secondary,
  },
});
