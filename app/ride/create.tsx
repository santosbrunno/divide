import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, MapPin, Calendar as CalendarIcon, Users, DollarSign, 
  Car, Dog, Cigarette, Wind, MessageCircle, Info, Clock, Route, TrendingUp
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../constants/theme';
import api from '../../services/api';
import { useRole } from '../../context/RoleContext';

export default function CreateRideScreen() {
  const router = useRouter();
  const { user } = useRole();
  const [loading, setLoading] = useState(false);
  const [fetchingVehicles, setFetchingVehicles] = useState(true);
  const [vehicles, setVehicles] = useState<any[]>([]);

  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [distanciaKm, setDistanciaKm] = useState('');
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [dateInput, setDateInput] = useState(new Date().toISOString().split('T')[0]);
  const [timeInput, setTimeInput] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));

  const [vagas, setVagas] = useState('4');
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);

  const [permitePets, setPermitePets] = useState(false);
  const [permiteFumar, setPermiteFumar] = useState(false);
  const [temAr, setTemAr] = useState(true);
  const [apenasMulheres, setApenasMulheres] = useState(false);
  const [nivelConversa, setNivelConversa] = useState<'quieto' | 'moderado' | 'tagarela'>('moderado');

  useEffect(() => {
    if (user?.id) fetchVehicles();
  }, [user]);

  const fetchVehicles = async () => {
    try {
      const res = await api.get(`/vehicles/${user.id}`);
      setVehicles(res.data);
      if (res.data.length > 0) setSelectedVehicle(res.data[0].vehicle_id);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
    } finally {
      setFetchingVehicles(false);
    }
  };

  const dist = parseFloat(distanciaKm.replace(',', '.')) || 0;
  const earnings = dist * 0.60;
  const passengerPrice = earnings * 1.10;

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      const d = new Date(date);
      d.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(d);
      setDateInput(d.toISOString().split('T')[0]);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selectedTime) {
      const d = new Date(date);
      d.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(d);
      setTimeInput(d.toTimeString().split(' ')[0].substring(0, 5));
    }
  };

  const formatForMySQL = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    if (Platform.OS === 'web') return `${dateInput} ${timeInput}:00`;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  };

  const handleCreate = async () => {
    if (!origem || !destino || dist <= 0 || !selectedVehicle) {
      Alert.alert('Atenção ⚠️', 'Preencha Origem, Destino, Distância e escolha um Veículo.');
      return;
    }

    try {
      setLoading(true);
      const dataPartida = formatForMySQL(date);
      
      await api.post('/oferecer-carona', {
        driver_id: user.id,
        vehicle_id: selectedVehicle,
        origem,
        destino,
        data_partida: dataPartida,
        vagas: parseInt(vagas),
        preco_base: passengerPrice,
        distancia_km: dist,
        permite_pets,
        permite_fumar,
        tem_ar_condicionado: temAr,
        apenas_mulheres,
        nivel_conversa,
      });

      Alert.alert('Sucesso! 🎉', 'Sua carona foi publicada.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao publicar carona.');
    } finally {
      setLoading(false);
    }
  };

  const PreferenceToggle = ({ icon: Icon, label, value, onValueChange }: any) => (
    <TouchableOpacity style={styles.preferenceItem} activeOpacity={0.7} onPress={() => onValueChange(!value)}>
      <View style={styles.preferenceLeft}>
        <View style={styles.prefIconBg}><Icon size={18} color={theme.colors.primary} /></View>
        <Text style={styles.preferenceLabel}>{label}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: '#E0E0E0', true: '#C8E6C9' }} thumbColor={value ? theme.colors.primary : '#F5F5F5'} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0F2417', '#1B3A20']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}><ArrowLeft size={22} color="#fff" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Oferta</Text>
        <TrendingUp size={22} color="#D4AF37" />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <LinearGradient colors={['rgba(45, 90, 39, 0.05)', 'rgba(212, 175, 55, 0.05)']} style={styles.mapMock}>
            <View style={styles.mapRouteLine}><View style={styles.mapDotStart} /><View style={styles.mapLineGold} /><View style={styles.mapDotEnd} /></View>
            <Text style={styles.mapLabel}>Visualização de Rota</Text>
          </LinearGradient>
        </View>

        <View style={styles.profitCard}>
           <View style={styles.profitHeader}>
              <View style={styles.goldBadge}><DollarSign size={16} color="#B8860B" /></View>
              <Text style={styles.profitTitle}>Ganhos Previstos</Text>
           </View>
           <Text style={styles.profitAmount}>{earnings.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
           <Text style={styles.profitSub}>Seu lucro líquido após taxas</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Detalhes da Rota</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><MapPin size={20} color={theme.colors.primary} /></View>
            <TextInput style={styles.inputField} placeholder="Saindo de..." value={origem} onChangeText={setOrigem} placeholderTextColor="#AAB4B0" />
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><MapPin size={20} color="#D4AF37" /></View>
            <TextInput style={styles.inputField} placeholder="Indo para..." value={destino} onChangeText={setDestino} placeholderTextColor="#AAB4B0" />
          </View>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><Route size={20} color={theme.colors.primary} /></View>
            <TextInput style={styles.inputField} placeholder="Distância em KM (ex: 45)" value={distanciaKm} onChangeText={setDistanciaKm} keyboardType="numeric" placeholderTextColor="#AAB4B0" />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <View style={styles.inputIcon}><CalendarIcon size={20} color={theme.colors.primary} /></View>
              {Platform.OS === 'web' ? (
                <TextInput style={styles.inputField} value={dateInput} onChangeText={setDateInput} keyboardType="default" />
              ) : (
                <TouchableOpacity style={styles.clickable} onPress={() => setShowDatePicker(true)}><Text style={styles.displayText}>{date.toLocaleDateString('pt-BR')}</Text></TouchableOpacity>
              )}
            </View>
            <View style={[styles.inputGroup, { flex: 0.8 }]}>
              <View style={styles.inputIcon}><Clock size={20} color={theme.colors.primary} /></View>
              {Platform.OS === 'web' ? (
                <TextInput style={styles.inputField} value={timeInput} onChangeText={setTimeInput} keyboardType="default" />
              ) : (
                <TouchableOpacity style={styles.clickable} onPress={() => setShowTimePicker(true)}><Text style={styles.displayText}>{date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text></TouchableOpacity>
              )}
            </View>
          </View>
          {showDatePicker && Platform.OS !== 'web' && <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />}
          {showTimePicker && Platform.OS !== 'web' && <DateTimePicker value={date} mode="time" display="default" onChange={onTimeChange} is24Hour />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Passageiros</Text>
          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}><Users size={18} color={theme.colors.primary} /></View>
            <TextInput style={styles.inputField} placeholder="Vagas" keyboardType="numeric" value={vagas} onChangeText={setVagas} placeholderTextColor="#AAB4B0" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚗 Veículo</Text>
          {fetchingVehicles ? <ActivityIndicator size="small" color={theme.colors.primary} /> : (
            <View style={styles.vehicleList}>
              {vehicles.map((v) => (
                <TouchableOpacity key={v.vehicle_id} style={[styles.vehicleCard, selectedVehicle === v.vehicle_id && styles.selectedVehicle]} onPress={() => setSelectedVehicle(v.vehicle_id)}>
                  <Car size={20} color={selectedVehicle === v.vehicle_id ? '#fff' : theme.colors.primary} />
                  <Text style={[styles.vehicleLabel, selectedVehicle === v.vehicle_id && { color: '#fff' }]}>{v.brand} {v.model} ({v.plate})</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛡️ Preferências</Text>
          <PreferenceToggle icon={Dog} label="Aceita Pets" value={permitePets} onValueChange={setPermitePets} />
          <PreferenceToggle icon={Cigarette} label="Permite Fumar" value={permiteFumar} onValueChange={setPermiteFumar} />
          <PreferenceToggle icon={Wind} label="Ar-condicionado" value={temAr} onValueChange={setTemAr} />
          <PreferenceToggle icon={Users} label="Apenas para Mulheres" value={apenasMulheres} onValueChange={setApenasMulheres} />
          <View style={styles.conversaSection}>
            <Text style={styles.conversaLabel}>🗣️ Nível de Conversa</Text>
            <View style={styles.conversaButtons}>
              {(['quieto', 'moderado', 'tagarela'] as const).map((nivel) => (
                <TouchableOpacity key={nivel} style={[styles.nivelBtn, nivelConversa === nivel && styles.nivelBtnActive]} onPress={() => setNivelConversa(nivel)}>
                  <Text style={[styles.nivelBtnText, nivelConversa === nivel && styles.nivelBtnTextActive]}>{nivel.charAt(0).toUpperCase() + nivel.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleCreate} disabled={loading} activeOpacity={0.9}>
          <LinearGradient colors={['#E67E22', '#D35400']} style={styles.publishBtn}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishText}>Publicar Carona</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAF9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 18, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  content: { flex: 1, padding: 20 },
  mapContainer: { height: 120, borderRadius: 20, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#E8EEE9', backgroundColor: '#fff' },
  mapMock: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mapRouteLine: { flexDirection: 'row', alignItems: 'center', width: '70%', justifyContent: 'space-between' },
  mapDotStart: { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  mapDotEnd: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#D4AF37' },
  mapLineGold: { height: 2, flex: 1, backgroundColor: '#D4AF37', marginHorizontal: 4, borderRadius: 1 },
  mapLabel: { fontSize: 11, color: '#AAB4B0', marginTop: 12, fontWeight: '600' },
  profitCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24, marginBottom: 24, borderWidth: 2, borderColor: '#D4AF37', elevation: 8, shadowColor: '#2D5A27', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12, alignItems: 'center' },
  profitHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  goldBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFBEA', justifyContent: 'center', alignItems: 'center' },
  profitTitle: { fontSize: 15, fontWeight: '700', color: '#2D5A27' },
  profitAmount: { fontSize: 36, fontWeight: '900', color: '#2D5A27', letterSpacing: -1 },
  profitSub: { fontSize: 13, color: '#AAB4B0', marginTop: 4 },
  section: { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: '#2D5A27', marginBottom: 14 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7F6', borderRadius: 14, marginBottom: 10, paddingHorizontal: 14 },
  inputIcon: { width: 30 },
  inputField: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#2D5A27' },
  clickable: { flex: 1, paddingVertical: 14, justifyContent: 'center' },
  displayText: { fontSize: 15, color: '#2D5A27' },
  row: { flexDirection: 'row' },
  vehicleList: { gap: 10 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, backgroundColor: '#F5F7F6', borderWidth: 1.5, borderColor: 'transparent' },
  selectedVehicle: { backgroundColor: '#2D5A27', borderColor: '#1B3A20' },
  vehicleLabel: { fontSize: 14, fontWeight: '600', color: '#2D5A27' },
  preferenceItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F4F1' },
  preferenceLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prefIconBg: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center' },
  preferenceLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
  conversaSection: { marginTop: 14 },
  conversaLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.gray, marginBottom: 8 },
  conversaButtons: { flexDirection: 'row', gap: 8 },
  nivelBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8, backgroundColor: '#F5F7F6', borderWidth: 1, borderColor: '#E0E0E0' },
  nivelBtnActive: { backgroundColor: '#E8F5E9', borderColor: theme.colors.primary },
  nivelBtnText: { fontSize: 12, color: theme.colors.gray, fontWeight: '600' },
  nivelBtnTextActive: { color: theme.colors.primary, fontWeight: '800' },
  footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F4F1' },
  publishBtn: { borderRadius: 18, paddingVertical: 18, alignItems: 'center', elevation: 6 },
  publishText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
});
