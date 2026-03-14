import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle, MapPin, Clock, User, ArrowLeft, MessageCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useRole } from '../../context/RoleContext';

export default function RideConfirmationScreen() {
  const { id, rideData } = useLocalSearchParams();
  const router = useRouter();
  const { user, role } = useRole();

  let ride = null;
  try {
    if (rideData) {
      ride = JSON.parse(decodeURIComponent(rideData as string));
    }
  } catch (error) {
    console.warn('Failed to parse rideData from params', error);
  }

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorTitle}>Carona não encontrada</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const basePrice = parseFloat(ride.preco_base) || 0;
  const taxaServico = basePrice * 0.10;
  const valorTotal = basePrice + taxaServico;

  const isLessThan24h = () => {
    try {
      const departureDate = new Date(ride.horario_partida);
      const now = new Date();
      const differenceInMs = departureDate.getTime() - now.getTime();
      return differenceInMs < 24 * 60 * 60 * 1000;
    } catch {
      return false;
    }
  };

  const formatTime = (horario: string) => {
    try {
      const date = new Date(horario);
      return date.toLocaleString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return horario;
    }
  };

  const handleConfirmarReserva = async () => {
    try {
      await api.post('/reservar', {
        ride_id: ride.ride_id || ride.id,
        passenger_id: user?.id || 1,
        preco_base: basePrice,
      });
      Alert.alert(
        '🎉 Reserva Confirmada!',
        `Sua carona para ${ride.destino} está garantida.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Ops!', 'Parece que as vagas acabaram enquanto você decidia.');
    }
  };

  const handleOpenChat = () => {
    const rideId   = ride.ride_id || ride.id;
    const driverId = ride.driver_id;
    if (!user?.id || !driverId) {
      Alert.alert('Atenção', 'Faça login para usar o chat.');
      return;
    }
    router.push(
      `/chat/${rideId}?my_id=${user.id}&passenger_id=${user.id}&driver_id=${driverId}` +
      `&other_name=${encodeURIComponent(ride.motorista || 'Motorista')}` +
      `&destination=${encodeURIComponent(ride.destino || '')}`
    );
  };

  const less24h = isLessThan24h();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0F2417', '#2D5A27']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmar Reserva</Text>
        <View style={{ width: 34 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Route Card */}
        <View style={styles.routeCard}>
          <LinearGradient
            colors={['#1B3A20', '#2D5A27']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.routeStrip}
          >
            <View style={styles.routeCity}>
              <MapPin size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.routeCityText}>{ride.origem}</Text>
            </View>
            <View style={styles.routeArrowContainer}>
              <View style={styles.routeDash} />
              <Text style={styles.routeArrow}>→</Text>
              <View style={styles.routeDash} />
            </View>
            <View style={styles.routeCity}>
              <MapPin size={14} color="rgba(255,255,255,0.7)" />
              <Text style={styles.routeCityText}>{ride.destino}</Text>
            </View>
          </LinearGradient>

          <View style={styles.rideMeta}>
            <View style={styles.metaItem}>
              <User size={15} color={theme.colors.gray} />
              <Text style={styles.metaText}>{ride.motorista}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Clock size={15} color={theme.colors.primary} />
              <Text style={[styles.metaText, { color: theme.colors.primary }]}>
                {formatTime(ride.horario_partida)}
              </Text>
            </View>
          </View>
        </View>

        {/* Cost Card */}
        <View style={styles.costCard}>
          <Text style={styles.costTitle}>💳 Resumo de Custos</Text>

          <View style={styles.costRow}>
            <View style={styles.costLabelRow}>
              <View style={styles.costDot} />
              <Text style={styles.costLabel}>Ajuda de custo ao motorista</Text>
            </View>
            <Text style={styles.costValue}>R$ {basePrice.toFixed(2).replace('.', ',')}</Text>
          </View>

          <View style={styles.costRow}>
            <View style={styles.costLabelRow}>
              <View style={[styles.costDot, { backgroundColor: theme.colors.secondary }]} />
              <Text style={styles.costLabel}>Taxa de serviço Divide (10%)</Text>
            </View>
            <Text style={[styles.costValue, { color: theme.colors.secondary }]}>
              R$ {taxaServico.toFixed(2).replace('.', ',')}
            </Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>
              R$ {valorTotal.toFixed(2).replace('.', ',')}
            </Text>
          </View>
        </View>

        {/* Warning */}
        <View style={[styles.warningCard, less24h && styles.warningCardActive]}>
          <AlertTriangle size={20} color={less24h ? '#E65100' : '#BF8C00'} />
          <Text style={[styles.warningText, less24h && styles.warningTextActive]}>
            Cancelamentos feitos com menos de 24h de antecedência não dão direito ao reembolso da taxa de serviço (10%).
          </Text>
        </View>

        {/* Chat Button — só para passageiros */}
        {role === 'passenger' && (
          <TouchableOpacity
            onPress={handleOpenChat}
            activeOpacity={0.85}
            style={styles.chatButtonOuter}
          >
            <View style={styles.chatButton}>
              <MessageCircle size={20} color={theme.colors.primary} />
              <Text style={styles.chatButtonText}>Dúvidas? Fale com o motorista</Text>
            </View>
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerPriceRow}>
          <Text style={styles.footerLabel}>Total</Text>
          <Text style={styles.footerPrice}>R$ {valorTotal.toFixed(2).replace('.', ',')}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleConfirmarReserva}
          style={styles.confirmOuter}
        >
          <LinearGradient
            colors={['#E67E22', '#D35400']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmButton}
          >
            <CheckCircle size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirmar e Pagar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  routeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  routeCity: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  routeCityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  routeArrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  routeDash: {
    height: 1,
    width: 16,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  routeArrow: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 18,
  },
  rideMeta: {
    flexDirection: 'row',
    padding: 14,
    gap: 10,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: theme.colors.gray,
    flex: 1,
  },
  metaDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#F0F4F1',
  },
  costCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  costTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 16,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  costLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  costDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  costLabel: {
    fontSize: 14,
    color: theme.colors.gray,
    flex: 1,
  },
  costValue: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFDE7',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#BF8C00',
    marginBottom: 10,
  },
  warningCardActive: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#E65100',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#7B5800',
    lineHeight: 19,
  },
  warningTextActive: {
    color: '#7B3800',
  },
  chatButtonOuter: {
    marginTop: 4,
    marginBottom: 8,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F0F7F1',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
  },
  chatButtonText: {
    color: theme.colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F1',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  footerPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 14,
    color: theme.colors.gray,
    fontWeight: '600',
  },
  footerPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  confirmOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7F6',
    gap: 12,
  },
  errorEmoji: {
    fontSize: 52,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  backBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
