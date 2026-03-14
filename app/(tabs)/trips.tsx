import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { MapPin, Clock, Car, User, AlertCircle, DollarSign } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import api from '../../services/api';

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
  const [trips, setTrips] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // ID mockado do passageiro logado (igual ao usado na reserva)
  const PASSENGER_ID = 1; 

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
      return differenceInMs > 0 && differenceInMs < (24 * 60 * 60 * 1000);
    } catch (e) {
      return false;
    }
  };

  const renderTripCard = ({ item }: { item: Booking }) => {
    const isCloseToDeparture = isLessThan24h(item.horario_partida);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.routeContainer}>
            <MapPin size={16} color={theme.colors.primary} />
            <Text style={styles.routeText}>{item.origem} → {item.destino}</Text>
          </View>
          <View style={[styles.statusBadge, isCloseToDeparture ? styles.statusWarningBadge : styles.statusSuccessBadge]}>
            <Text style={[styles.statusText, isCloseToDeparture ? styles.statusWarningText : styles.statusSuccessText]}>
              {isCloseToDeparture ? 'Menos de 24h' : 'Confirmada'}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <User size={14} color={theme.colors.gray} />
          <Text style={styles.detailsText}>{item.motorista}</Text>
          <Car size={14} color={theme.colors.gray} style={{ marginLeft: 12 }} />
          <Text style={styles.detailsText}>{item.carro}</Text>
        </View>

        <View style={styles.detailsRow}>
          <Clock size={14} color={theme.colors.gray} />
          <Text style={styles.detailsText}>{item.horario_partida}</Text>
        </View>

        <View style={styles.financeContainer}>
          <Text style={styles.financeLabel}>Valor Pago:</Text>
          <Text style={styles.totalPaid}>R$ {parseFloat(item.valor_pago).toFixed(2).replace('.', ',')}</Text>
        </View>
        
        <View style={styles.feeContainer}>
          <DollarSign size={14} color={theme.colors.secondary} />
          <Text style={styles.feeText}>Taxa de Serviço: R$ {parseFloat(item.taxa_plataforma).toFixed(2).replace('.', ',')}</Text>
        </View>

        {isCloseToDeparture && (
          <View style={styles.retentionWarning}>
            <AlertCircle size={16} color={theme.colors.warningText} />
            <Text style={styles.retentionText}>Período de retenção de taxa ativo</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Minhas Viagens</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={trips}
          renderItem={renderTripCard}
          keyExtractor={(item, index) => item.booking_id ? item.booking_id.toString() : index.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Car size={48} color={theme.colors.gray} style={{ opacity: 0.5 }} />
              <Text style={styles.emptyText}>Você ainda não fez nenhuma reserva.</Text>
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
    backgroundColor: theme.colors.background,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    elevation: 2,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
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
    alignItems: 'center',
    marginBottom: 12,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  statusSuccessBadge: {
    backgroundColor: '#E8F5E9',
  },
  statusWarningBadge: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusSuccessText: {
    color: '#2E7D32',
  },
  statusWarningText: {
    color: '#E65100',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  detailsText: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  financeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  financeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  totalPaid: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    padding: 6,
    backgroundColor: '#F5F5F5',
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  feeText: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.secondary,
  },
  retentionWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.warning,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.warningBorder,
  },
  retentionText: {
    fontSize: 12,
    color: theme.colors.warningText,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    marginTop: 12,
    color: theme.colors.gray,
    fontSize: 16,
  }
});
