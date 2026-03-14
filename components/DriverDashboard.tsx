import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MapPin, Plus, Car, Users, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
            passengers: curr.passageiro_id
              ? [{ id: curr.passageiro_id, nome: curr.passageiro_nome }]
              : [],
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

  const renderDriverRide = ({ item }: { item: any }) => (
    <View style={styles.card}>
      {/* Route Header */}
      <LinearGradient
        colors={['#F0F7F1', '#E8F5E9']}
        style={styles.cardHeader}
      >
        <View style={styles.routeRow}>
          <View style={styles.cityChip}>
            <MapPin size={12} color={theme.colors.primary} />
            <Text style={styles.cityText} numberOfLines={1}>{item.origem}</Text>
          </View>
          <Text style={styles.routeArrow}>→</Text>
          <View style={[styles.cityChip, styles.cityChipDest]}>
            <MapPin size={12} color={theme.colors.secondary} />
            <Text style={[styles.cityText, { color: theme.colors.secondary }]} numberOfLines={1}>{item.destino}</Text>
          </View>
        </View>
        <View style={styles.rideMetaRow}>
          <View style={styles.metaChip}>
            <Clock size={12} color={theme.colors.gray} />
            <Text style={styles.metaChipText}>{formatTime(item.horario_partida)}</Text>
          </View>
          <View style={[styles.metaChip, styles.seatsBadge]}>
            <Text style={styles.seatsText}>🪑 {item.vagas_disponiveis} vagas</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Passengers */}
      <View style={styles.passengerSection}>
        <View style={styles.passengerTitleRow}>
          <Users size={15} color={theme.colors.primary} />
          <Text style={styles.passengerTitle}>Passageiros</Text>
          <View style={styles.passengerCount}>
            <Text style={styles.passengerCountText}>{item.passengers.length}</Text>
          </View>
        </View>

        {item.passengers.length === 0 ? (
          <Text style={styles.noPassengers}>Aguardando passageiros...</Text>
        ) : (
          item.passengers.map((p: any) => (
            <View key={p.id} style={styles.passengerItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.nome.charAt(0).toUpperCase()}</Text>
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Painel do Motorista</Text>
          <Text style={styles.subTitle}>Suas caronas ativas</Text>
        </View>
        {userStatus === 'aprovado' ? (
          <PremiumButton
            title="+ Carona"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade de criar carona sendo finalizada!')}
            variant="success"
            textStyle={{ fontSize: 14 }}
            style={{ borderRadius: 20, paddingHorizontal: 8 }}
          />
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>⏳ Pendente</Text>
          </View>
        )}
      </View>

      {userStatus !== 'aprovado' && (
        <View style={styles.pendingWarning}>
          <Text style={styles.pendingWarningText}>
            Sua conta está aguardando aprovação do administrador. Você receberá acesso em breve!
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Carregando caronas...</Text>
        </View>
      ) : (
        <FlatList
          data={driverRides}
          renderItem={renderDriverRide}
          keyExtractor={(item) => item.ride_id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🚗</Text>
              <Text style={styles.emptyTitle}>Nenhuma carona ativa</Text>
              <Text style={styles.emptyText}>
                Crie uma carona e comece a receber passageiros!
              </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.3,
  },
  subTitle: {
    fontSize: 13,
    color: theme.colors.gray,
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  pendingText: {
    color: '#E65100',
    fontSize: 13,
    fontWeight: '700',
  },
  pendingWarning: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#FFB300',
  },
  pendingWarningText: {
    color: '#7B5800',
    fontSize: 13,
    lineHeight: 18,
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
  cardHeader: {
    padding: 14,
    gap: 10,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  cityChipDest: {
    borderColor: '#FFCC80',
  },
  cityText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primary,
    flex: 1,
  },
  routeArrow: {
    fontSize: 16,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  rideMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metaChipText: {
    fontSize: 12,
    color: theme.colors.gray,
    fontWeight: '500',
  },
  seatsBadge: {
    backgroundColor: '#E8F5E9',
  },
  seatsText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  passengerSection: {
    padding: 14,
  },
  passengerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  passengerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
  },
  passengerCount: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  passengerCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  noPassengers: {
    fontSize: 13,
    color: theme.colors.gray,
    fontStyle: 'italic',
    paddingLeft: 4,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
    backgroundColor: '#F7F9F8',
    borderRadius: 10,
    padding: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  passengerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
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
