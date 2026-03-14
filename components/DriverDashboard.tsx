import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { MapPin, Plus, Car, Users, Clock, MessageCircle, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import api from '../services/api';
import { PremiumButton } from './PremiumButton';

interface DriverDashboardProps {
  userId?: number;
  userStatus?: string;
}

interface Chat {
  ride_id: number;
  origem: string;
  destino: string;
  passenger_id: number;
  passenger_name: string;
  last_message: string | null;
  last_time: string;
  unread_count: number;
}

export const DriverDashboard = ({ userId, userStatus }: DriverDashboardProps) => {
  const router = useRouter();
  const [tab, setTab] = useState<'rides' | 'chats'>('rides');
  const [driverRides, setDriverRides] = useState<any[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingRides, setLoadingRides] = useState(true);
  const [loadingChats, setLoadingChats] = useState(false);

  const DRIVER_ID = userId;

  useEffect(() => {
    if (DRIVER_ID) {
      fetchDriverRides();
    }
  }, [DRIVER_ID]);

  useEffect(() => {
    if (tab === 'chats' && DRIVER_ID) {
      fetchChats();
    }
  }, [tab, DRIVER_ID]);

  const fetchDriverRides = async () => {
    try {
      setLoadingRides(true);
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
      setLoadingRides(false);
    }
  };

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const res = await api.get(`/chats/driver/${DRIVER_ID}`);
      setChats(res.data);
    } catch (err) {
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoadingChats(false);
    }
  };

  const openChat = (chat: Chat) => {
    router.push(
      `/chat/${chat.ride_id}?my_id=${DRIVER_ID}&passenger_id=${chat.passenger_id}` +
      `&driver_id=${DRIVER_ID}` +
      `&other_name=${encodeURIComponent(chat.passenger_name)}` +
      `&destination=${encodeURIComponent(chat.destino)}`
    );
  };

  // Abre chat a partir do card de carona (passageiro que reservou)
  const openChatWithPassenger = (rideId: number, destino: string, passenger: { id: number; nome: string }) => {
    router.push(
      `/chat/${rideId}?my_id=${DRIVER_ID}&passenger_id=${passenger.id}` +
      `&driver_id=${DRIVER_ID}` +
      `&other_name=${encodeURIComponent(passenger.nome)}` +
      `&destination=${encodeURIComponent(destino)}`
    );
  };

  const formatTime = (horario: string) => {
    try {
      return new Date(horario).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return horario; }
  };

  // ── Render: ride card ───────────────────────────────────────
  const renderDriverRide = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <LinearGradient colors={['#F0F7F1', '#E8F5E9']} style={styles.cardHeader}>
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

              {/* Botão de chat — só para passageiros com reserva */}
              <TouchableOpacity
                style={styles.passengerChatBtn}
                activeOpacity={0.75}
                onPress={() => openChatWithPassenger(item.ride_id, item.destino, p)}
              >
                <MessageCircle size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );

  // ── Render: chat card ───────────────────────────────────────
  const renderChatCard = ({ item }: { item: Chat }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => openChat(item)}
      activeOpacity={0.85}
    >
      {/* Avatar */}
      <LinearGradient
        colors={['#1B3A20', '#2D5A27']}
        style={styles.chatAvatar}
      >
        <Text style={styles.chatAvatarText}>
          {item.passenger_name.charAt(0).toUpperCase()}
        </Text>
      </LinearGradient>

      {/* Info */}
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.passenger_name}</Text>
        <Text style={styles.chatRoute} numberOfLines={1}>
          {item.origem} → {item.destino}
        </Text>
        {item.last_message ? (
          <Text style={styles.chatLastMsg} numberOfLines={1}>
            {item.last_message}
          </Text>
        ) : null}
      </View>

      {/* Right side */}
      <View style={styles.chatRight}>
        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
        <Text style={styles.chatTime}>{formatTime(item.last_time)}</Text>
        <ChevronRight size={16} color={theme.colors.gray} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* ── Top header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>Painel do Motorista</Text>
          <Text style={styles.subTitle}>
            {tab === 'rides' ? 'Suas caronas ativas' : 'Mensagens de passageiros'}
          </Text>
        </View>
        {userStatus === 'aprovado' ? (
          <PremiumButton
            title="+ Carona"
            onPress={() => Alert.alert('Em breve', 'Funcionalidade de criar carona sendo finalizada!')}
            variant="success"
            textStyle={{ fontSize: 14 }}
            style={{ borderRadius: 20 }}
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
            Sua conta está aguardando aprovação. Você receberá acesso em breve!
          </Text>
        </View>
      )}

      {/* ── Tab switcher ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'rides' && styles.tabBtnActive]}
          onPress={() => setTab('rides')}
        >
          <Car size={16} color={tab === 'rides' ? theme.colors.primary : theme.colors.gray} />
          <Text style={[styles.tabBtnText, tab === 'rides' && styles.tabBtnTextActive]}>
            Caronas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === 'chats' && styles.tabBtnActive]}
          onPress={() => setTab('chats')}
        >
          <MessageCircle size={16} color={tab === 'chats' ? theme.colors.primary : theme.colors.gray} />
          <Text style={[styles.tabBtnText, tab === 'chats' && styles.tabBtnTextActive]}>
            Conversas
          </Text>
          {/* Badge de não lidos */}
          {chats.some(c => c.unread_count > 0) && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {chats.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Conteúdo da aba ── */}
      {tab === 'rides' ? (
        loadingRides ? (
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
                <Text style={styles.emptyText}>Crie uma carona e comece a receber passageiros!</Text>
              </View>
            }
          />
        )
      ) : (
        loadingChats ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando conversas...</Text>
          </View>
        ) : (
          <FlatList
            data={chats}
            renderItem={renderChatCard}
            keyExtractor={(item) => `${item.ride_id}-${item.passenger_id}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyTitle}>Nenhuma conversa ainda</Text>
                <Text style={styles.emptyText}>
                  Quando um passageiro te enviar uma mensagem, ela aparecerá aqui.
                </Text>
              </View>
            }
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F6' },

  // ── Header ─────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.colors.text, letterSpacing: -0.3 },
  subTitle: { fontSize: 13, color: theme.colors.gray, marginTop: 2 },
  pendingBadge: {
    backgroundColor: '#FFF8E1', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#FFE082',
  },
  pendingText: { color: '#E65100', fontSize: 13, fontWeight: '700' },
  pendingWarning: {
    marginHorizontal: 16, marginBottom: 12, backgroundColor: '#FFF8E1',
    borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#FFB300',
  },
  pendingWarningText: { color: '#7B5800', fontSize: 13, lineHeight: 18 },

  // ── Tab bar ─────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 14,
    backgroundColor: '#EAEEEB',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabBtnActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  tabBtnText: { fontSize: 14, fontWeight: '600', color: theme.colors.gray },
  tabBtnTextActive: { color: theme.colors.primary, fontWeight: '800' },
  tabBadge: {
    backgroundColor: '#FF4444', borderRadius: 9, minWidth: 18, height: 18,
    paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center',
  },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  // ── Lists ────────────────────────────────────────────────────
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },

  // ── Ride card ───────────────────────────────────────────────
  card: {
    backgroundColor: '#fff', borderRadius: 20, marginBottom: 14, overflow: 'hidden',
    elevation: 4, shadowColor: '#2D5A27', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10,
  },
  cardHeader: { padding: 14, gap: 10 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cityChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  cityChipDest: { borderColor: '#FFCC80' },
  cityText: { fontSize: 13, fontWeight: '700', color: theme.colors.primary, flex: 1 },
  routeArrow: { fontSize: 16, color: theme.colors.gray, fontWeight: '600' },
  rideMetaRow: { flexDirection: 'row', gap: 8 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  metaChipText: { fontSize: 12, color: theme.colors.gray, fontWeight: '500' },
  seatsBadge: { backgroundColor: '#E8F5E9' },
  seatsText: { fontSize: 12, color: theme.colors.primary, fontWeight: '700' },
  passengerSection: { padding: 14 },
  passengerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  passengerTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.text, flex: 1 },
  passengerCount: {
    backgroundColor: theme.colors.primary, borderRadius: 10, minWidth: 22, height: 22,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  passengerCountText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  noPassengers: { fontSize: 13, color: theme.colors.gray, fontStyle: 'italic', paddingLeft: 4 },
  passengerItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6,
    backgroundColor: '#F7F9F8', borderRadius: 10, padding: 8,
  },
  passengerChatBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  avatar: {
    width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  passengerName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },

  // ── Chat card ───────────────────────────────────────────────
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  chatAvatar: {
    width: 46, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  chatAvatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  chatInfo: { flex: 1, gap: 2 },
  chatName: { fontSize: 15, fontWeight: '700', color: theme.colors.text },
  chatRoute: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  chatLastMsg: { fontSize: 13, color: theme.colors.gray, marginTop: 2 },
  chatRight: { alignItems: 'flex-end', gap: 4 },
  unreadBadge: {
    backgroundColor: '#FF4444', borderRadius: 10, minWidth: 20, height: 20,
    paddingHorizontal: 5, justifyContent: 'center', alignItems: 'center',
  },
  unreadText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  chatTime: { fontSize: 11, color: theme.colors.gray },

  // ── Helpers ─────────────────────────────────────────────────
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 60 },
  loadingText: { color: theme.colors.gray, fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 60, padding: 24 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginBottom: 6 },
  emptyText: { color: theme.colors.gray, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
