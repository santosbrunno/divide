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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  TrendingUp, Users, MapPin, DollarSign, LogOut, BarChart2, ChevronRight, ArrowLeft, Calendar, Info
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useRole } from '../../context/RoleContext';

const { width } = Dimensions.get('window');

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
      setFaturamento(faturamentoRes.data.total_faturamento || 0);
      setViagens(faturamentoRes.data.total_viagens || 0);
      setTaxas(taxasRes.data || []);
      setPendingCount(pendentesRes.data.length || 0);
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
        <StatusBar barStyle="light-content" backgroundColor="#0A1A0D" />
        <LinearGradient colors={['#0A1A0D', '#0F2417']} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color="#E67E22" />
        <Text style={styles.loadingText}>Sincronizando dados...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1A0D" />
      <LinearGradient colors={['#0A1A0D', '#0F2417', '#1B3A20']} style={StyleSheet.absoluteFill} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <ArrowLeft size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerLabel}>Relatório Financeiro</Text>
                <Text style={styles.headerTitle}>Dashboard Admin</Text>
            </View>
             <Image
              source={require('../../assets/images/divide_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Main Revenue Card (Glass) */}
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            style={styles.revenueCard}
          >
            <View style={styles.revenueTop}>
                <View style={styles.revenueIconBg}>
                    <TrendingUp size={24} color="#E67E22" />
                </View>
                <View>
                    <Text style={styles.revenueLabel}>Receita Gerada (10%)</Text>
                    <Text style={styles.revenueValue}>R$ {faturamento.toFixed(2).replace('.', ',')}</Text>
                </View>
            </View>
            <View style={styles.revenueBottom}>
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>{viagens}</Text>
                    <Text style={styles.statLab}>Viagens</Text>
                </View>
                <View style={styles.vLine} />
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>{pendingCount}</Text>
                    <Text style={styles.statLab}>Pendentes</Text>
                </View>
                 <View style={styles.vLine} />
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>Active</Text>
                    <Text style={styles.statLab}>Status</Text>
                </View>
            </View>
          </LinearGradient>

          {/* Activity Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transações Recentes</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Ver tudo</Text></TouchableOpacity>
          </View>

          {taxas.length === 0 ? (
             <View style={styles.emptyCard}>
                <Info size={32} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText}>Sem dados no momento</Text>
             </View>
          ) : (
            taxas.map((item) => (
              <LinearGradient 
                key={item.booking_id} 
                colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
                style={styles.taxaCard}
              >
                <View style={styles.taxaLeft}>
                    <View style={styles.taxaIconBg}>
                        <DollarSign size={16} color="#4ADE80" />
                    </View>
                    <View>
                        <Text style={styles.taxaPassenger}>{item.passageiro}</Text>
                        <Text style={styles.taxaRoute}>{item.origin_city} ➔ {item.destination_city}</Text>
                    </View>
                </View>
                <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.taxaValue}>+ R$ {parseFloat(item.taxa_plataforma).toFixed(2).replace('.', ',')}</Text>
                    <Text style={styles.taxaDate}>{new Date(item.data_reserva).toLocaleDateString()}</Text>
                </View>
              </LinearGradient>
            ))
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
             <LogOut size={20} color="rgba(255,255,255,0.4)" />
             <Text style={styles.logoutText}>Encerrar Sessão Admin</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1A0D' },
  safeArea: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'rgba(255,255,255,0.4)', marginTop: 12, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flex: 1 },
  headerLabel: { color: '#E67E22', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  logo: { width: 60, height: 30, opacity: 0.6 },

  scroll: { padding: 20 },

  revenueCard: { 
    borderRadius: 32, padding: 24, marginBottom: 32,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' 
  },
  revenueTop: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  revenueIconBg: { width: 56, height: 56, borderRadius: 20, backgroundColor: 'rgba(230,126,34,0.15)', justifyContent: 'center', alignItems: 'center' },
  revenueLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  revenueValue: { color: '#fff', fontSize: 32, fontWeight: '900' },
  
  revenueBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLab: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  vLine: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.05)' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  seeAll: { color: '#E67E22', fontSize: 13, fontWeight: '700' },

  taxaCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 16, borderRadius: 20, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  taxaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  taxaIconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(74,222,128,0.1)', justifyContent: 'center', alignItems: 'center' },
  taxaPassenger: { color: '#fff', fontSize: 15, fontWeight: '700' },
  taxaRoute: { color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 },
  taxaValue: { color: '#4ADE80', fontSize: 16, fontWeight: '800' },
  taxaDate: { color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 2 },

  emptyCard: { padding: 40, alignItems: 'center', gap: 12 },
  emptyText: { color: 'rgba(255,255,255,0.2)', fontSize: 14, fontWeight: '600' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 40, paddingBottom: 20 },
  logoutText: { color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: '700' },
});
