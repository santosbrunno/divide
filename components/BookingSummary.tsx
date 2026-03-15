import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Route, 
  Info, 
  CheckCircle, 
  X, 
  Wallet, 
  ShieldCheck,
  MapPin
} from 'lucide-react-native';
import { theme } from '../constants/theme';

interface BookingSummaryProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  distanciaKm: number;
  origem?: string;
  destino?: string;
}

const { width } = Dimensions.get('window');

export default function BookingSummary({ 
  visible, 
  onClose, 
  onConfirm, 
  distanciaKm,
  origem,
  destino 
}: BookingSummaryProps) {
  const [loading, setLoading] = useState(false);

  // Regras de Precificação Divide
  const valorMotorista = distanciaKm * 0.60;
  const taxaApp = valorMotorista * 0.10;
  const valorTotal = valorMotorista + taxaApp;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Card de Confirmação */}
        <View style={styles.card}>
          
          {/* Botão Fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={20} color="#AAB4B0" />
          </TouchableOpacity>

          {/* Cabeçalho */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Resumo da Viagem</Text>
            <View style={styles.headerUnderline} />
          </View>

          {/* Detalhes da Rota (Opcional) */}
          {(origem || destino) && (
            <View style={styles.routeContainer}>
               <View style={styles.routeItem}>
                  <MapPin size={14} color={theme.colors.primary} />
                  <Text style={styles.routeText} numberOfLines={1}>{origem || 'Origem'}</Text>
               </View>
               <View style={styles.routeDivider} />
               <View style={styles.routeItem}>
                  <MapPin size={14} color={theme.colors.secondary} />
                  <Text style={styles.routeText} numberOfLines={1}>{destino || 'Destino'}</Text>
               </View>
            </View>
          )}

          {/* Grid de Detalhes */}
          <View style={styles.detailsContainer}>
            
            {/* Distância */}
            <View style={styles.detailRow}>
              <View style={styles.iconBgGold}>
                <Route size={18} color="#D4AF37" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Distância Estimada</Text>
                <Text style={styles.detailValueText}>{distanciaKm.toFixed(1)} km</Text>
              </View>
            </View>

            {/* Valor Carona */}
            <View style={styles.detailRow}>
              <View style={[styles.iconBg, { backgroundColor: '#F0F7F1' }]}>
                <Wallet size={18} color="#2D5A27" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Valor da Carona</Text>
                <Text style={styles.detailSubValue}>{formatCurrency(valorMotorista)}</Text>
              </View>
            </View>

            {/* Taxa App */}
            <View style={styles.detailRow}>
              <View style={[styles.iconBg, { backgroundColor: '#FFF3E0' }]}>
                <ShieldCheck size={18} color="#E67E22" />
              </View>
              <View style={styles.detailInfo}>
                <Text style={styles.detailLabel}>Taxa de Serviço</Text>
                <Text style={styles.detailSubValue}>{formatCurrency(taxaApp)}</Text>
              </View>
            </View>

          </View>

          {/* Seção Total */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total a Pagar</Text>
            <Text style={styles.totalValue}>{formatCurrency(valorTotal)}</Text>
          </View>

          {/* Botão de Ação */}
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.submitOuter}
          >
            <LinearGradient
              colors={['#E67E22', '#D35400']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.submitText}>
                    Confirmar Reserva - {formatCurrency(valorTotal)}
                  </Text>
                  <CheckCircle size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Rodapé Justificativa */}
          <View style={styles.footer}>
            <Info size={12} color="#AAB4B0" />
            <Text style={styles.footerText}>
              Cálculo baseado em R$ 0,60/km conforme a política de sustentabilidade do Divide.
            </Text>
          </View>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    elevation: 10,
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 4,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D5A27',
    letterSpacing: -0.5,
  },
  headerUnderline: {
    width: 40,
    height: 4,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    marginTop: 8,
  },
  routeContainer: {
    backgroundColor: '#F5F7F6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 13,
    color: '#4A4A4A',
    fontWeight: '600',
    flex: 1,
  },
  routeDivider: {
    height: 1,
    backgroundColor: '#E8EEE9',
    marginVertical: 8,
    marginLeft: 22,
  },
  detailsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBgGold: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFBEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#AAB4B0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValueText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D5A27',
  },
  detailSubValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4A4A4A',
  },
  totalSection: {
    borderTopWidth: 1.5,
    borderTopColor: '#F5F7F6',
    paddingTop: 16,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4A4A4A',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2D5A27',
    letterSpacing: -1,
  },
  submitOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  submitText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 8,
    gap: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#AAB4B0',
    flex: 1,
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
