import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { 
  Car, MessageSquare, Plus, Users, MapPin, 
  ChevronRight, Calendar, Info, Clock, CheckCircle2, AlertCircle
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import api from '../services/api';
import { useRouter } from 'expo-router';

interface Chat {
  ride_id: number;
  origem: string;
  destino: string;
  passenger_id: number;
  passenger_name: string;
  last_message: string;
  last_time: string;
  unread_count: number;
}

export const DriverDashboard = ({ userId, userStatus }: { userId?: number; userStatus?: string }) => {
  const [activeTab, setActiveTab] = useState<'rides' | 'chats'>('rides');
  const [myRides, setMyRides] = useState<any[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'rides') {
        const response = await api.get(`/motorista/${userId}/caronas`);
        setMyRides(response.data);
      } else {
        const response = await api.get(`/chats/driver/${userId}`);
        setChats(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do motorista:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToChat = (rideId: number, passengerId: number, passengerName: string, destination: string) => {
    router.push({
      pathname: `/chat/${rideId}`,
      params: {
        my_id: userId,
        passenger_id: passengerId,
        driver_id: userId,
        other_name: passengerName,
        destination: destination
      }
    });
  };

  const renderRideItem = ({ item }: { item: any }) => (
    <View style={styles.rideCard}>
       <View style={styles.rideHeader}>
         <View style={styles.rideInfo}>
            <Text style={styles.rideRoute}>{item.origem} → {item.destino}</Text>
            <View style={styles.timeTag}>
              <Clock size={12} color="rgba(255,255,255,0.4)" />
              <Text style={styles.timeText}>{new Date(item.horario_partida).toLocaleString('pt-BR')}</Text>
            </View>
         </View>
         <View style={styles.vagasBadge}>
            <Text style={styles.vagasText}>{item.vagas_disponiveis} vagas</Text>
         </View>
       </View>

       {item.passageiro_id ? (
         <TouchableOpacity 
           style={styles.passengerRow}
           onPress={() => navigateToChat(item.ride_id, item.passageiro_id, item.passageiro_nome, item.destino)}
          >
           <View style={styles.passAv}>
             <Text style={styles.passAvText}>{item.passageiro_nome[0]}</Text>
           </View>
           <View style={{flex: 1}}>
             <Text style={styles.passName}>{item.passageiro_nome}</Text>
             <Text style={styles.passStatus}>Confirmado · R$ {item.valor_pago}</Text>
           </View>
           <MessageSquare size={18} color="#E67E22" />
         </TouchableOpacity>
       ) : (
         <View style={styles.emptyPass}>
           <Text style={styles.emptyPassText}>Aguardando passageiros...</Text>
         </View>
       )}
    </View>
  );

  const renderChatItem = ({ item }: { item: Chat }) => (
    <TouchableOpacity 
      style={styles.chatCard}
      onPress={() => navigateToChat(item.ride_id, item.passenger_id, item.passenger_name, item.destino)}
    >
      <View style={styles.chatAv}>
        <Text style={styles.chatAvText}>{item.passenger_name[0]}</Text>
      </View>
      <View style={styles.chatContent}>
         <View style={styles.chatHeader}>
            <Text style={styles.chatName}>{item.passenger_name}</Text>
            <Text style={styles.chatTime}>{new Date(item.last_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
         </View>
         <Text style={styles.chatDest}>{item.destino}</Text>
         <Text style={styles.chatMsg} numberOfLines={1}>{item.last_message || 'Inicie a conversa...'}</Text>
      </View>
      {item.unread_count > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread_count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (userStatus === 'pendente') {
    return (
      <View style={styles.pendingContainer}>
         <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.pendingCard}>
            <AlertCircle size={40} color="#E67E22" />
            <Text style={styles.pendingTitle}>Cadastro em Análise</Text>
            <Text style={styles.pendingSub}>Nossa equipe está revisando seus documentos. Você será notificado assim que puder dirigir!</Text>
         </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'rides' && styles.activeTab]}
          onPress={() => setActiveTab('rides')}
        >
          <Car size={18} color={activeTab === 'rides' ? '#fff' : 'rgba(255,255,255,0.4)'} />
          <Text style={[styles.tabLabel, activeTab === 'rides' && styles.activeTabLabel]}>Caronas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'chats' && styles.activeTab]}
          onPress={() => setActiveTab('chats')}
        >
          <MessageSquare size={18} color={activeTab === 'chats' ? '#fff' : 'rgba(255,255,255,0.4)'} />
          <Text style={[styles.tabLabel, activeTab === 'chats' && styles.activeTabLabel]}>Conversas</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={theme.colors.secondary} size="large" style={{marginTop: 50}} />
        ) : (
          <FlatList
            data={activeTab === 'rides' ? myRides : chats}
            renderItem={activeTab === 'rides' ? renderRideItem : renderChatItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>{activeTab === 'rides' ? '🚗' : '💬'}</Text>
                <Text style={styles.emptyTitle}>{activeTab === 'rides' ? 'Sem caronas ativas' : 'Nenhuma conversa'}</Text>
                <Text style={styles.emptySub}>{activeTab === 'rides' ? 'Toque no + para oferecer uma carona.' : 'As mensagens dos passageiros aparecerão aqui.'}</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Floating Action Button */}
      {activeTab === 'rides' && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => router.push('/ride/create')}
          activeOpacity={0.9}
        >
          <LinearGradient colors={['#E67E22', '#D35400']} style={styles.fabGrad}>
            <Plus size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { 
    flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 20, alignSelf: 'center' 
  },
  tab: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, 
    paddingVertical: 10, borderRadius: 16 
  },
  activeTab: { backgroundColor: 'rgba(255,255,255,0.08)' },
  tabLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: '700' },
  activeTabLabel: { color: '#fff' },

  content: { flex: 1 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  
  // Rides Card
  rideCard: { 
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 20, 
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' 
  },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  rideRoute: { color: '#fff', fontSize: 17, fontWeight: '900' },
  timeTag: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  timeText: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '600' },
  vagasBadge: { backgroundColor: 'rgba(74,222,128,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  vagasText: { color: '#4ADE80', fontSize: 11, fontWeight: '800' },

  passengerRow: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, 
    backgroundColor: 'rgba(255,255,255,0.04)', padding: 12, borderRadius: 16 
  },
  passAv: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(230,126,34,0.2)', justifyContent: 'center', alignItems: 'center' },
  passAvText: { color: '#E67E22', fontWeight: '800' },
  passName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  passStatus: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },
  emptyPass: { padding: 16, alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  emptyPassText: { color: 'rgba(255,255,255,0.25)', fontSize: 13 },

  // Chat Card
  chatCard: { 
    flexDirection: 'row', alignItems: 'center', gap: 14, 
    backgroundColor: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 24, 
    marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' 
  },
  chatAv: { width: 50, height: 50, borderRadius: 18, backgroundColor: 'rgba(46,90,39,0.3)', justifyContent: 'center', alignItems: 'center' },
  chatAvText: { color: '#4ADE80', fontSize: 20, fontWeight: '900' },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  chatName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  chatTime: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  chatDest: { color: '#E67E22', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginTop: 2 },
  chatMsg: { color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4 },
  unreadBadge: { backgroundColor: '#E67E22', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadText: { color: '#fff', fontSize: 10, fontWeight: '900' },

  fab: { position: 'absolute', bottom: 30, right: 30, elevation: 12, shadowColor: '#E67E22', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 15 },
  fabGrad: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },

  empty: { padding: 60, alignItems: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptySub: { color: 'rgba(255,255,255,0.35)', textAlign: 'center' },

  pendingContainer: { flex: 1, justifyContent: 'center', padding: 30 },
  pendingCard: { padding: 32, borderRadius: 32, alignItems: 'center', gap: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pendingTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  pendingSub: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 20 },
});
