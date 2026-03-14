import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, CheckCircle, MapPin, Clock, User, ArrowRight } from 'lucide-react-native';
import { theme } from '../../constants/theme';
import api from '../../services/api';

export default function RideConfirmationScreen() {
  const { id, rideData } = useLocalSearchParams();
  const router = useRouter();
  
  let ride = null;
  try {
    if (rideData) {
      ride = JSON.parse(decodeURIComponent(rideData as string));
    }
  } catch (error) {
    console.warn("Failed to parse rideData from params", error);
  }

  if (!ride) {
    return (
      <View style={styles.errorContainer}>
        <Text>Dados da carona não encontrados.</Text>
      </View>
    );
  }

  const basePrice = parseFloat(ride.preco_base) || 0;
  const taxaServico = basePrice * 0.10;
  const valorTotal = basePrice + taxaServico;

  const isLessThanh24h = () => {
    try {
      const departureDate = new Date(ride.horario_partida);
      const now = new Date();
      const differenceInMs = departureDate.getTime() - now.getTime();
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      return differenceInMs < twentyFourHoursInMs;
    } catch (e) {
      return false;
    }
  };

  const handleConfirmarReserva = async () => {
    try {
      const response = await api.post('/reservar', {
        ride_id: ride.ride_id || ride.id, // O backend espera o ride_id da tabela.
        passenger_id: 1, // Por enquanto usamos o ID 1 para testes
        preco_base: basePrice // Usando a variável segura convertida ao invés de ride.preco_base
      });

      Alert.alert(
        'Sucesso!', 
        `Sua carona para ${ride.destino} está garantida.`,
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Ops!', 'Parece que as vagas acabaram enquanto você decidia.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Trajeto</Text>
          <View style={styles.routeHeader}>
            <View style={styles.locationContainer}>
              <MapPin size={18} color={theme.colors.primary} />
              <Text style={styles.locationText}>{ride.origem}</Text>
            </View>
            <ArrowRight size={18} color={theme.colors.gray} />
            <View style={styles.locationContainer}>
              <MapPin size={18} color={theme.colors.primary} />
              <Text style={styles.locationText}>{ride.destino}</Text>
            </View>
          </View>
          
          <View style={styles.rideMeta}>
            <View style={styles.metaItem}>
              <User size={16} color={theme.colors.gray} />
              <Text style={styles.metaText}>{ride.motorista}</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.colors.gray} />
              <Text style={styles.metaText}>{ride.horario_partida}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custos da Viagem</Text>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Ajuda de custo do motorista</Text>
            <Text style={styles.costValue}>R$ {basePrice.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Taxa de serviço Divide (10%)</Text>
            <Text style={styles.costValue}>R$ {taxaServico.toFixed(2).replace('.', ',')}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>R$ {valorTotal.toFixed(2).replace('.', ',')}</Text>
          </View>
        </View>

        <View style={[styles.warningCard, isLessThanh24h() && styles.warningCardActive]}>
          <AlertTriangle size={24} color={theme.colors.warningText} />
          <Text style={styles.warningText}>
            Atenção: Cancelamentos feitos com menos de 24h de antecedência da partida não dão direito ao reembolso da taxa de serviço (10%).
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmarReserva}>
          <CheckCircle size={20} color={theme.colors.white} />
          <Text style={styles.confirmButtonText}>Confirmar e Pagar via Mercado Pago</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  section: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  locationContainer: {
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  rideMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    color: theme.colors.gray,
  },
  costValue: {
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  warningCard: {
    backgroundColor: theme.colors.warning,
    borderColor: theme.colors.warningBorder,
    borderWidth: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  warningCardActive: {
    borderWidth: 2,
    borderColor: '#FAAD14',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.warningText,
    lineHeight: 18,
  },
  footer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: theme.colors.white,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonText: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
