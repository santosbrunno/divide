import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ArrowLeft, MoreVertical, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import api from '../../services/api';

interface Message {
  message_id: number;
  ride_id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  timestamp: string;
  is_read: boolean;
  sender_name: string;
}

// Balão de mensagem individual com fade-in
const MessageBubble = ({ msg, isMe }: { msg: Message; isMe: boolean }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(isMe ? 30 : -30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  const formatHour = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  return (
    <Animated.View
      style={[
        styles.bubbleRow,
        isMe ? styles.bubbleRowMe : styles.bubbleRowOther,
        { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
      ]}
    >
      {isMe ? (
        <LinearGradient
          colors={['#2D5A27', '#4A7C3A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bubble, styles.bubbleMe]}
        >
          <Text style={styles.bubbleTextMe}>{msg.content}</Text>
          <Text style={styles.bubbleTimeMe}>{formatHour(msg.timestamp)}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.bubble, styles.bubbleOther]}>
          <Text style={styles.bubbleTextOther}>{msg.content}</Text>
          <Text style={styles.bubbleTimeOther}>{formatHour(msg.timestamp)}</Text>
        </View>
      )}
    </Animated.View>
  );
};

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const ride_id    = Number(params.ride_id);
  const my_id      = Number(params.my_id);
  const passenger_id = Number(params.passenger_id);
  const driver_id  = Number(params.driver_id);
  const other_name = String(params.other_name || 'Usuário');
  const destination = String(params.destination || '');

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Busca o histórico de mensagens
  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await api.get(`/messages/${ride_id}/${passenger_id}`);
      setMessages(res.data);
    } catch (err) {
      console.error('Erro ao buscar mensagens:', err);
    } finally {
      setLoading(false);
    }
  }, [ride_id, passenger_id]);

  // Primeira carga + poll a cada 5s
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Scroll para o fim quando chegam novas mensagens
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setText('');

    const receiver_id = my_id === passenger_id ? driver_id : passenger_id;

    try {
      const res = await api.post('/messages', {
        ride_id,
        sender_id: my_id,
        receiver_id,
        content: trimmed,
      });
      // Adiciona imediatamente a mensagem à lista para feedback instantâneo
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
      setText(trimmed); // restaura o texto
    } finally {
      setSending(false);
    }
  };

  const showReportMenu = () => {
    Alert.alert(
      '⋯ Opções da conversa',
      '',
      [
        {
          text: '🚩 Denunciar usuário',
          onPress: () =>
            Alert.alert(
              'Denúncia enviada',
              'Nossa equipe irá analisar esta conversa em breve. Obrigado por ajudar a manter a plataforma segura.'
            ),
        },
        {
          text: '🔇 Bloquear usuário',
          onPress: () => Alert.alert('Em breve', 'Funcionalidade de bloqueio está sendo implementada.'),
        },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* ── Header ─────────────────────────── */}
        <LinearGradient
          colors={['#0F2417', '#1B3A20', '#2D5A27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
            <ArrowLeft size={22} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>
                {other_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.headerName} numberOfLines={1}>{other_name}</Text>
              {destination ? (
                <Text style={styles.headerSub}>📍 {destination}</Text>
              ) : null}
            </View>
          </View>

          <TouchableOpacity style={styles.headerMenu} onPress={showReportMenu}>
            <MoreVertical size={22} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── Mensagens ──────────────────────── */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Carregando conversa...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            data={messages}
            keyExtractor={(item) => item.message_id.toString()}
            renderItem={({ item }) => (
              <MessageBubble msg={item} isMe={item.sender_id === my_id} />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <MessageCircle size={48} color="#C8D8C9" />
                <Text style={styles.emptyChatTitle}>Sem mensagens ainda</Text>
                <Text style={styles.emptyChatSub}>
                  {my_id === passenger_id
                    ? 'Diga oi para o motorista! 👋'
                    : 'O passageiro ainda não enviou mensagens.'}
                </Text>
              </View>
            }
          />
        )}

        {/* ── Input ──────────────────────────── */}
        <View style={styles.inputBar}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Digite uma mensagem..."
              placeholderTextColor="#AAB4B0"
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              returnKeyType="default"
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.85}
            disabled={!text.trim() || sending}
          >
            <LinearGradient
              colors={text.trim() && !sending ? ['#E67E22', '#D35400'] : ['#C8D8C9', '#B0B8B2']}
              style={styles.sendButton}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  kav: {
    flex: 1,
  },
  // ── Header ──────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 10,
    elevation: 8,
    shadowColor: '#0F2417',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerBack: {
    padding: 6,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  headerAvatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  headerName: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.2,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 1,
  },
  headerMenu: {
    padding: 6,
  },
  // ── Lista de mensagens ────────────────────
  messageList: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  messageListContent: {
    padding: 14,
    paddingBottom: 8,
  },
  bubbleRow: {
    marginBottom: 8,
    maxWidth: '80%',
  },
  bubbleRowMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleRowOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#EEF2EE',
  },
  bubbleTextMe: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  bubbleTextOther: {
    color: '#1B3022',
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTimeMe: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  bubbleTimeOther: {
    color: '#AAB4B0',
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  // ── Empty state ──────────────────────────
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 10,
    paddingHorizontal: 32,
  },
  emptyChatTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#4A7C3A',
    marginTop: 4,
  },
  emptyChatSub: {
    fontSize: 14,
    color: theme.colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
  // ── Loading ───────────────────────────────
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
  // ── Input bar ─────────────────────────────
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#EDF2EE',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F5F7F5',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E0E8E1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    color: '#1B3022',
    lineHeight: 21,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});
