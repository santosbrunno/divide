import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Search, MapPin, Car, Clock, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import api from '../services/api';
import { useRouter } from 'expo-router';

interface Ride {
  ride_id: number;
  driver_id: number;   // necessário para abrir o chat
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
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
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

  const renderRideCard = ({ item }: { item: Ride }) => {
    const valorFinal = item.preco_base * 1.10;

    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => router.push(`/ride/${item.ride_id}?rideData=${encodeURIComponent(JSON.stringify(item))}`)}
      >
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <View style={styles.routeBox}>
              <View style={styles.routeStop}>
                <View style={[styles.routeDot, styles.routeDotOrigin]} />
                <Text style={styles.routeCity} numberOfLines={1}>{item.origem}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeStop}>
                <View style={[styles.routeDot, styles.routeDotDest]} />
                <Text style={styles.routeCity} numberOfLines={1}>{item.destino}</Text>
              </View>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>por pessoa</Text>
              <Text style={styles.price}>
                R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <Users size={13} color={theme.colors.gray} />
              <Text style={styles.metaText}>{item.motorista}</Text>
            </View>
            <View style={styles.metaItem}>
              <Car size={13} color={theme.colors.gray} />
              <Text style={styles.metaText}>{item.modelo}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={13} color={theme.colors.primary} />
              <Text style={[styles.metaText, { color: theme.colors.primary, fontWeight: '600' }]}>
                {formatTime(item.horario_partida)}
              </Text>
            </View>
          </View>

          <LinearGradient
            colors={['#2D5A27', '#4A7C3A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookButton}
          >
            <Text style={styles.bookButtonText}>Ver detalhes →</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={[styles.searchBox, searchFocused && styles.searchBoxFocused]}>
        <Search size={20} color={searchFocused ? theme.colors.primary : theme.colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Origem, destino ou motorista..."
          placeholderTextColor={theme.colors.gray}
          value={search}
          onChangeText={setSearch}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={{ color: theme.colors.gray, fontSize: 18 }}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Caronas Disponíveis</Text>
        {!loading && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredRides.length}</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Buscando caronas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRides}
          renderItem={renderRideCard}
          keyExtractor={(item) => item.ride_id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🚗</Text>
              <Text style={styles.emptyTitle}>Nenhuma carona encontrada</Text>
              <Text style={styles.emptyText}>Tente buscar por outra cidade ou aguarde novas ofertas.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E0E8E1',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    gap: 10,
  },
  searchBoxFocused: {
    borderColor: theme.colors.primary,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.text,
  },
  countBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    paddingBottom: 12,
  },
  routeBox: {
    flex: 1,
    gap: 6,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  routeDotOrigin: {
    borderColor: theme.colors.primary,
    backgroundColor: '#E8F5E9',
  },
  routeDotDest: {
    borderColor: theme.colors.secondary,
    backgroundColor: '#FFF3E0',
  },
  routeLine: {
    width: 2,
    height: 14,
    backgroundColor: '#E0E8E1',
    marginLeft: 4,
    marginVertical: -2,
  },
  routeCity: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  priceBox: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  priceLabel: {
    fontSize: 10,
    color: theme.colors.gray,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  price: {
    fontSize: 18,
    fontWeight: '900',
    color: theme.colors.secondary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginHorizontal: 16,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
    paddingBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  bookButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 60,
  },
  loadingText: {
    color: theme.colors.gray,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
