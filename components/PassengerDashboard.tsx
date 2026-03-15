import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Switch,
  ScrollView,
} from 'react-native';
import { 
  Search, MapPin, Car, Clock, Users, Filter, 
  Dog, Cigarette, Wind, MessageCircle, Info, ChevronRight, X, Navigation
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import api from '../services/api';
import { useRouter } from 'expo-router';

interface Ride {
  ride_id: number;
  driver_id: number;
  motorista: string;
  modelo: string;
  horario_partida: string;
  preco_base: number;
  origem: string;
  destino: string;
  permite_pets: boolean | number;
  permite_fumar: boolean | number;
  tem_ar_condicionado: boolean | number;
  apenas_mulheres: boolean | number;
  nivel_conversa: 'quieto' | 'moderado' | 'tagarela';
}

export const PassengerDashboard = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Filters state
  const [filterPets, setFilterPets] = useState(false);
  const [filterFumar, setFilterFumar] = useState(false);
  const [filterAr, setFilterAr] = useState(false);
  const [filterMulheres, setFilterMulheres] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchRides();
  }, [filterPets, filterFumar, filterAr, filterMulheres]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const params = {
        permite_pets: filterPets || undefined,
        permite_fumar: filterFumar || undefined,
        tem_ar_condicionado: filterAr || undefined,
        apenas_mulheres: filterMulheres || undefined,
      };
      
      const response = await api.get('/caronas', { params });
      setRides(response.data);
    } catch (error) {
      console.error('Erro ao buscar caronas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRides = rides.filter(ride =>
    !search ||
    ride.origem.toLowerCase().includes(search.toLowerCase()) ||
    ride.destino.toLowerCase().includes(search.toLowerCase()) ||
    ride.motorista.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (horario: string) => {
    try {
      const date = new Date(horario);
      return date.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return horario;
    }
  };

  const PreferenceIcon = ({ icon: Icon, active }: any) => {
    if (!active && active !== undefined) return null;
    return (
      <View style={styles.prefIconWrapper}>
        <Icon size={12} color="#4ADE80" />
      </View>
    );
  };

  const renderRideCard = ({ item }: { item: Ride }) => {
    const valorFinal = item.preco_base * 1.10;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/ride/${item.ride_id}?rideData=${encodeURIComponent(JSON.stringify(item))}`)}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
          style={styles.card}
        >
          {item.apenas_mulheres ? (
            <LinearGradient colors={['#FF5F6D', '#FFC371']} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.womenOnlyBadge}>
              <Users size={10} color="#fff" />
              <Text style={styles.womenOnlyText}>Exclusivo para Mulheres</Text>
            </LinearGradient>
          ) : null}

          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <View style={styles.driverAv}>
                <Text style={styles.avText}>{item.motorista.charAt(0)}</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.motoristaName}>{item.motorista}</Text>
                <Text style={styles.carModel}>{item.modelo}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.currency}>R$</Text>
                <Text style={styles.priceText}>{valorFinal.toFixed(0)}</Text>
                <Text style={styles.priceDecinals}>,{valorFinal.toFixed(2).split('.')[1]}</Text>
              </View>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.routeVisual}>
                <View style={styles.dot} />
                <View style={styles.line} />
                <Navigation size={12} color="#E67E22" />
              </View>
              <View style={styles.routeText}>
                <Text style={styles.cityText}>{item.origem}</Text>
                <Text style={styles.cityText}>{item.destino}</Text>
              </View>
            </View>

            <View style={styles.footerRow}>
              <View style={styles.timeTag}>
                <Clock size={12} color="rgba(255,255,255,0.4)" />
                <Text style={styles.timeText}>{formatTime(item.horario_partida)}</Text>
              </View>
              <View style={styles.prefRow}>
                <PreferenceIcon icon={Dog} active={item.permite_pets} />
                <PreferenceIcon icon={Wind} active={item.tem_ar_condicionado} />
                <PreferenceIcon icon={MessageCircle} active={true} />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBar}>
        <View style={[styles.searchInputWrap, searchFocused && styles.inputActive]}>
          <Search size={18} color={searchFocused ? '#E67E22' : 'rgba(255,255,255,0.3)'} />
          <TextInput
            style={styles.input}
            placeholder="Qual o seu destino?"
            placeholderTextColor="rgba(255,255,255,0.2)"
            value={search}
            onChangeText={setSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, (filterPets || filterFumar || filterAr || filterMulheres) && styles.filterActive]}
          onPress={() => setFilterModalVisible(true)}
        >
          <Filter size={20} color={ (filterPets || filterFumar || filterAr || filterMulheres) ? '#fff' : 'rgba(255,255,255,0.6)'} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRides}
        renderItem={renderRideCard}
        keyExtractor={(item) => item.ride_id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.sectionTitle}>Caronas Disponíveis em SC</Text>
            <View style={styles.countTag}>
              <Text style={styles.countText}>{filteredRides.length}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🌲</Text>
            <Text style={styles.emptyTitle}>Nenhuma carona agora</Text>
            <Text style={styles.emptySub}>Tente limpar os filtros ou buscar outra cidade.</Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal visible={filterModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtros</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)} p-10>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.filterGroup}>
              <View style={styles.filterRow}>
                <View style={styles.filterLabelCol}>
                  <Text style={styles.filterName}>Aceita Animais 🐕</Text>
                  <Text style={styles.filterDesc}>Ver motoristas que levam pets</Text>
                </View>
                <Switch value={filterPets} onValueChange={setFilterPets} trackColor={{false: '#333', true: '#2D5A27'}} />
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterLabelCol}>
                  <Text style={styles.filterName}>Ar-condicionado ❄️</Text>
                  <Text style={styles.filterDesc}>Viagens mais confortáveis</Text>
                </View>
                <Switch value={filterAr} onValueChange={setFilterAr} trackColor={{false: '#333', true: '#2D5A27'}} />
              </View>

              <View style={styles.filterRow}>
                <View style={styles.filterLabelCol}>
                  <Text style={styles.filterName}>Viagem Feminina 🎀</Text>
                  <Text style={styles.filterDesc}>Apenas motoristas mulheres</Text>
                </View>
                <Switch value={filterMulheres} onValueChange={setFilterMulheres} trackColor={{false: '#333', true: '#E67E22'}} />
              </View>
            </View>

            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
              <LinearGradient colors={['#E67E22', '#D35400']} style={styles.applyBtnGrad}>
                <Text style={styles.applyBtnText}>Aplicar Filtros</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, paddingTop: 10, marginBottom: 20 },
  searchInputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  inputActive: { borderColor: '#E67E22', backgroundColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontSize: 15 },
  filterBtn: {
    width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterActive: { backgroundColor: '#E67E22', borderColor: '#D35400' },

  list: { paddingHorizontal: 20, paddingBottom: 100 },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  countTag: { backgroundColor: '#2D5A27', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  countText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  card: { borderRadius: 24, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardContent: { padding: 18 },
  womenOnlyBadge: { paddingVertical: 6, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  womenOnlyText: { color: '#fff', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  driverAv: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(46,90,39,0.3)', justifyContent: 'center', alignItems: 'center' },
  avText: { color: '#4ADE80', fontSize: 18, fontWeight: '900' },
  driverInfo: { flex: 1 },
  motoristaName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  carModel: { color: 'rgba(255,255,255,0.35)', fontSize: 12 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  currency: { color: '#E67E22', fontSize: 12, fontWeight: '800', marginRight: 2 },
  priceText: { color: '#fff', fontSize: 24, fontWeight: '900' },
  priceDecinals: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '700' },

  routeContainer: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  routeVisual: { alignItems: 'center', gap: 4, width: 20, paddingTop: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  line: { width: 1, flex: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  routeText: { flex: 1, gap: 12 },
  cityText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },

  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 14 },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  prefRow: { flexDirection: 'row', gap: 6 },
  prefIconWrapper: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(74,222,128,0.08)', justifyContent: 'center', alignItems: 'center' },

  empty: { padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  emptySub: { color: 'rgba(255,255,255,0.35)', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#0F2417', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  filterGroup: { gap: 24 },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterLabelCol: { flex: 1 },
  filterName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  filterDesc: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  applyBtn: { marginTop: 40 },
  applyBtnGrad: { paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
