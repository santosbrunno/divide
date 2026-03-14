import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator
} from 'react-native';
import { Search, MapPin, Car } from 'lucide-react-native';
import { theme } from '../constants/theme';
import api from '../services/api';
import { useRouter } from 'expo-router';

interface Ride {
  ride_id: number;
  motorista: string;
  modelo: string;
  horario_partida: string;
  preco_base: number;
  origem: string;
  destino: string;
}

export const PassengerDashboard = () => {
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
    const valorFinal = item.preco_base * 1.10;

    return (
      <TouchableOpacity 
        style={styles.card} 
        onPress={() => router.push(`/ride/${item.ride_id}?rideData=${encodeURIComponent(JSON.stringify(item))}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.driverName}>{item.motorista}</Text>
          <Text style={styles.price}>
            R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.location}><MapPin size={14} color={theme.colors.primary} /> {item.origem} → {item.destino}</Text>
          <Text style={styles.carInfo}><Car size={14} color={theme.colors.gray} /> {item.modelo}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Search size={20} color={theme.colors.gray} />
        <TextInput 
          placeholder="Para onde você quer ir?" 
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
          keyExtractor={(item) => item.ride_id.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma carona disponível no momento para SC.</Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text
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
    elevation: 4,
    shadowColor: 'rgba(45, 90, 39, 0.15)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  cardBody: {
    gap: 6,
  },
  location: {
    fontSize: 15,
    color: theme.colors.text,
    fontWeight: '500'
  },
  carInfo: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.gray,
    fontSize: 15,
  },
});
