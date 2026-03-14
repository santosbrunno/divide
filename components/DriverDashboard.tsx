import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { MapPin, Plus, Car, Users } from 'lucide-react-native';
import { theme } from '../constants/theme';
import api from '../services/api';
import { PremiumButton } from './PremiumButton';

interface DriverDashboardProps {
  userId?: number;
  userStatus?: string;
}

export const DriverDashboard = ({ userId, userStatus }: DriverDashboardProps) => {
  const [driverRides, setDriverRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const DRIVER_ID = userId;

  useEffect(() => {
    if (DRIVER_ID) {
      fetchDriverRides();
    }
  }, [DRIVER_ID]);

  const fetchDriverRides = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/motorista/${DRIVER_ID}/caronas`);
      
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
          <MapPin size={18} color={theme.colors.primary} />
          <Text style={styles.ridePath}>{item.origem} → {item.destino}</Text>
        </View>
        <View style={styles.seatsBadge}>
           <Text style={styles.seatsText}>{item.vagas_disponiveis} vagas</Text>
        </View>
      </View>
      <Text style={styles.dateTime}>{item.horario_partida}</Text>
      
      <View style={styles.passengerList}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Users size={16} color={theme.colors.primary} />
            <Text style={styles.passengerTitle}>Passageiros Confirmados:</Text>
        </View>
        {item.passengers.length === 0 ? (
          <Text style={styles.noPassengers}>Nenhum passageiro ainda.</Text>
        ) : (
          item.passengers.map((p: any) => (
            <View key={p.id} style={styles.passengerItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.nome.charAt(0)}</Text>
              </View>
              <Text style={styles.passengerName}>{p.nome}</Text>
            </View>
          ))
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Painel do Motorista</Text>
        {userStatus === 'aprovado' ? (
            <PremiumButton 
                title="Abrir Vagas" 
                onPress={() => Alert.alert('Em breve', 'Funcionalidade de criar carona sendo finalizada!')}
                icon={<Plus size={20} color={theme.colors.white} />}
                variant="success"
                textStyle={{ fontSize: 13 }}
                style={{ borderRadius: 20 }}
            />
        ) : (
            <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pendente</Text>
            </View>
        )}
      </View>

      <Text style={styles.subTitle}>Minhas Caronas</Text>
      
      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={driverRides}
          renderItem={renderDriverRide}
          keyExtractor={(item) => item.ride_id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Car size={60} color={theme.colors.gray} style={{ opacity: 0.3 }} />
              <Text style={styles.emptyText}>Você ainda não tem caronas ativas.</Text>
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
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  pendingBadge: {
    backgroundColor: '#FFE082',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pendingText: {
    color: '#E65100',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 16,
    elevation: 4,
    shadowColor: 'rgba(45, 90, 39, 0.1)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
  },
  ridePath: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  seatsBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  seatsText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  dateTime: {
    fontSize: 14,
    color: theme.colors.gray,
    marginBottom: 12,
    marginLeft: 24,
  },
  passengerList: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  passengerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  noPassengers: {
    fontSize: 14,
    color: theme.colors.gray,
    fontStyle: 'italic',
    marginLeft: 22,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
    marginLeft: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  passengerName: {
    fontSize: 15,
    color: theme.colors.text,
  },
  emptyState: {
    marginTop: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: theme.colors.gray,
    fontSize: 16,
  },
});
