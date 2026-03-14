import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Search, MapPin, Car, Plus, TrendingUp, DollarSign } from 'lucide-react-native';
import { useRole } from '../../context/RoleContext';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useRouter } from 'expo-router';

// Types
interface Ride {
  id: string;
  motorista: string;
  modelo_carro: string;
  horario_partida: string;
  preco_base: number;
  origem: string;
  destino: string;
}

// Components
const PassengerView = () => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await api.get('/caronas');
      setRides(response.data);
    } catch (error) {
      console.error('Erro ao buscar caronas:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRideCard = ({ item }: { item: Ride }) => {
    // Valor Final com 10% de taxa
    const valorFinal = item.preco_base * 1.10;

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push(`/ride/${item.id}?rideData=${encodeURIComponent(JSON.stringify(item))}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.driverName}>{item.motorista}</Text>
          <Text style={styles.price}>
            R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.location}><MapPin size={14} /> {item.origem} → {item.destino}</Text>
          <Text style={styles.carInfo}><Car size={14} /> {item.modelo_carro}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.subContainer}>
      <View style={styles.searchBox}>
        <Search size={20} color={theme.colors.gray} />
        <TextInput 
          placeholder="Buscar carona em Santa Catarina..." 
          style={styles.searchInput}
          placeholderTextColor={theme.colors.gray}
        />
      </View>
      
      <Text style={styles.sectionTitle}>Caronas Disponíveis</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideCard}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Buscando caronas em Santa Catarina (Pomerode, Blumenau, Timbó)...</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const DriverView = () => {
  const [driverRides, setDriverRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ID mockado do motorista logado (Mudei para 1 que costuma ser o Admin/Motorista padrão criado)
  const DRIVER_ID = 1; 

  useEffect(() => {
    fetchDriverRides();
  }, []);

  const fetchDriverRides = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/motorista/${DRIVER_ID}/caronas`);
      
      // Agrupar passageiros por carona
      const groupedRides = response.data.reduce((acc: any, curr: any) => {
        const ride = acc.find((r: any) => r.ride_id === curr.ride_id);
        if (ride) {
          if (curr.passageiro_id) {
            ride.passengers.push({ id: curr.passageiro_id, nome: curr.passageiro_nome });
          }
        } else {
          acc.push({
            ride_id: curr.ride_id,
            origem: curr.origem,
            destino: curr.destino,
            horario_partida: curr.horario_partida,
            vagas_disponiveis: curr.vagas_disponiveis,
            passengers: curr.passageiro_id ? [{ id: curr.passageiro_id, nome: curr.passageiro_nome }] : []
          });
        }
        return acc;
      }, []);

      setDriverRides(groupedRides);
    } catch (error) {
      console.error('Erro ao buscar caronas do motorista:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDriverRide = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
          <MapPin size={16} color={theme.colors.primary} />
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.origem} → {item.destino}</Text>
        </View>
        <Text style={{ fontSize: 12, color: theme.colors.secondary, fontWeight: 'bold' }}>
          {item.vagas_disponiveis} vagas
        </Text>
      </View>
      <Text style={{ fontSize: 14, color: theme.colors.gray, marginBottom: 8 }}>{item.horario_partida}</Text>
      
      <View style={{ borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 8, marginTop: 4 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 6 }}>Passageiros confirmados:</Text>
        {item.passengers.length === 0 ? (
          <Text style={{ fontSize: 14, color: theme.colors.gray, fontStyle: 'italic' }}>Nenhum passageiro ainda.</Text>
        ) : (
          item.passengers.map((p: any) => (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 4 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#2E7D32', fontSize: 12, fontWeight: 'bold' }}>{p.nome.charAt(0)}</Text>
              </View>
              <Text style={{ fontSize: 14, color: theme.colors.text }}>{p.nome}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.subContainer}>
      <TouchableOpacity style={styles.createRideButton}>
        <Plus size={24} color={theme.colors.white} />
        <Text style={styles.createRideButtonText}>Oferecer Nova Carona</Text>
      </TouchableOpacity>
      
      <Text style={styles.sectionTitle}>Suas Caronas Ativas</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={driverRides}
          renderItem={renderDriverRide}
          keyExtractor={(item) => item.ride_id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Car size={48} color={theme.colors.gray} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>Você ainda não ofereceu caronas hoje.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const AdminView = () => {
  const router = useRouter();
  const [faturamento, setFaturamento] = useState<number | null>(null);

  useEffect(() => {
    fetchFaturamento();
  }, []);

  const fetchFaturamento = async () => {
    try {
      const response = await api.get('/admin/faturamento');
      setFaturamento(response.data.total_faturamento);
    } catch (error) {
      console.error('Erro ao buscar faturamento:', error);
      setFaturamento(0);
    }
  };
  
  return (
    <View style={styles.subContainer}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <TrendingUp size={24} color={theme.colors.secondary} />
          <Text style={styles.statValue}>
            {faturamento !== null 
              ? `R$ ${parseFloat(faturamento.toString()).toFixed(2).replace('.', ',')}` 
              : '...'}
          </Text>
          <Text style={styles.statLabel}>Lucro Total (Taxas)</Text>
        </View>
        <View style={styles.statCard}>
          <DollarSign size={24} color={theme.colors.primary} />
          <Text style={styles.statValue}>-</Text>
          <Text style={styles.statLabel}>Viagens Concluídas</Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.adminActionButton}
        onPress={() => router.push('/admin/dashboard')}
      >
        <Text style={styles.adminActionButtonText}>Ver Relatório Completo</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const { role } = useRole();

  return (
    <View style={styles.container}>
      {role === 'passenger' && <PassengerView />}
      {role === 'driver' && <DriverView />}
      {role === 'admin' && <AdminView />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  subContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  cardBody: {
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: theme.colors.text,
  },
  carInfo: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.gray,
    marginTop: 20,
    fontSize: 14,
  },
  createRideButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  createRideButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    elevation: 2,
    alignItems: 'center',
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
  },
  adminActionButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  adminActionButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
