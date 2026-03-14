import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MapPin, Clock, Car, User, AlertCircle, DollarSign, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useRole } from '../../context/RoleContext';

interface Booking {
  booking_id: number;
  ride_id: number;
  passenger_id: number;
  valor_pago: string;
  taxa_plataforma: string;
  status: string;
  origem: string;
  destino: string;
  horario_partida: string;
  motorista: string;
  carro: string;
}

export default function MyTripsScreen() {
  const { user } = useRole();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const PASSENGER_ID = user?.id || 0;

  useEffect(() => {
    fetchMyTrips();
  }, []);

  const fetchMyTrips = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/minhas-reservas/${PASSENGER_ID}`);
      setTrips(response.data);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLessThan24h = (horarioStr: string) => {
    try {
      const departureDate = new Date(horarioStr);
      const now = new Date();
      const differenceInMs = departureDate.getTime() - now.getTime();
      return differenceInMs > 0 && differenceInMs < 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  };

  const formatTime = (horario: string) => {
    try {
      const date = new Date(horario);
      return date.toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return horario;
    }
  };

  const renderTripCard = ({ item }: { item: Booking }) => {
    const isClose = isLessThan24h(item.horario_partida);

    return (
      <View style={styles.card}>
        {/* Route Strip */}
        <LinearGradient
          colors={['#0F2417', '#2D5A27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cardStrip}
        >
          <View style={styles.routeRow}>
            <Text style={styles.routeCity} numberOfLines={1}>{item.origem}</Text>
            <Text style={styles.routeArrow}>→</Text>
            <Text style={styles.routeCity} numberOfLines={1}>{item.destino}</Text>
          </View>
          <View style={[styles.statusBadge, isClose ? styles.statusWarning : styles.statusOk]}>
            {isClose
              ? <AlertCircle size={12} color="#fff" />
              : <CheckCircle size={12} color="#fff" />
            }
            <Text style={styles.statusText}>
              {isClose ? 'Menos de 24h' : 'Confirmada'}
            </Text>
          </View>
        </LinearGradient>

        {/* Details */}
        <View style={styles.cardBody}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <User size={14} color={theme.colors.gray} />
              <Text style={styles.detailText}>{item.motorista}</Text>
            </View>
            <View style={styles.detailItem}>
              <Car size={14} color={theme.colors.gray} />
              <Text style={styles.detailText}>{item.carro}</Text>
            </View>
            <View style={styles.detailItem}>
              <Clock size={14} color={theme.colors.primary} />
              <Text style={[styles.detailText, { color: theme.colors.primary, fontWeight: '600' }]}>
                {formatTime(item.horario_partida)}
              </Text>
            </View>
          </View>

          {/* Finance */}
          <View style={styles.financeRow}>
            <View>
              <Text style={styles.financeLabel}>Valor Pago</Text>
              <Text style={styles.financeTotal}>
                R$ {parseFloat(item.valor_pago).toFixed(2).replace('.', ',')}
              </Text>
            </View>
            <View style={styles.feeTag}>
              <DollarSign size={12} color={theme.colors.secondary} />
              <Text style={styles.feeText}>
                Taxa: R$ {parseFloat(item.taxa_plataforma).toFixed(2).replace('.', ',')}
              </Text>
            </View>
          </View>

          {isClose && (
            <View style={styles.retentionWarning}>
              <AlertCircle size={14} color="#E65100" />
              <Text style={styles.retentionText}>
                ⚠️ Cancelamentos em menos de 24h não têm reembolso da taxa (10%).
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F2417', '#2D5A27']}
        style={styles.pageHeader}
      >
        <Text style={styles.pageTitle}>Minhas Viagens</Text>
        {!loading && (
          <View style={styles.tripCountBadge}>
            <Text style={styles.tripCountText}>{trips.length}</Text>
          </View>
        )}
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Buscando reservas...</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item, index) =>
            item.booking_id ? item.booking_id.toString() : index.toString()
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🗺️</Text>
              <Text style={styles.emptyTitle}>Nenhuma viagem ainda</Text>
              <Text style={styles.emptyText}>
                Explore as caronas disponíveis e reserve a sua!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 10,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    flex: 1,
    letterSpacing: -0.3,
  },
  tripCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tripCountText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  listContent: {
    padding: 16,
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
  cardStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routeCity: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
  },
  routeArrow: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusOk: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusWarning: {
    backgroundColor: '#E65100',
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  cardBody: {
    padding: 14,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F7F6',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: '500',
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    marginTop: 4,
  },
  financeLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  financeTotal: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  feeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF3E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  feeText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  retentionWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB300',
  },
  retentionText: {
    flex: 1,
    fontSize: 12,
    color: '#7B5800',
    lineHeight: 17,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: theme.colors.gray,
    fontSize: 14,
  },
  emptyState: {
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
    marginBottom: 6,
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
