import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { theme } from '../constants/theme';
import {
  User, Mail, Lock, CreditCard, Car, ChevronLeft, ArrowRight,
} from 'lucide-react-native';

// Helper CPF Functions
function isValidCpf(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let soma = 0,
    resto;
  for (let i = 1; i <= 9; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;
  soma = 0;
  for (let i = 1; i <= 10; i++) soma = soma + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;
  return true;
}

function maskCpf(value: string) {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
}

interface InputFieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  hasError?: boolean;
  keyboardType?: any;
  secureTextEntry?: boolean;
  autoCapitalize?: any;
  maxLength?: number;
}

const InputField = ({
  icon, placeholder, value, onChangeText, hasError, ...rest
}: InputFieldProps) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[
      styles.inputWrapper,
      focused && styles.inputFocused,
      hasError && styles.inputError,
    ]}>
      <View style={styles.inputIcon}>{icon}</View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#AAB4B0"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...rest}
      />
    </View>
  );
};

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [cnh, setCnh] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [cor, setCor] = useState('');
  const [isDriver, setIsDriver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const router = useRouter();

  const handleCpfChange = (value: string) => {
    setCpf(maskCpf(value));
  };

  const handleRegister = async () => {
    let newErrors: { [key: string]: boolean } = {};
    if (!nome) newErrors.nome = true;
    if (!email) newErrors.email = true;
    if (!cpf) newErrors.cpf = true;
    if (!senha) newErrors.senha = true;
    if (isDriver) {
      if (!cnh) newErrors.cnh = true;
      if (!marca) newErrors.marca = true;
      if (!modelo) newErrors.modelo = true;
      if (!placa) newErrors.placa = true;
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos destacados.');
      return;
    }
    if (!isValidCpf(cpf)) {
      setErrors({ ...newErrors, cpf: true });
      Alert.alert('CPF Inválido', 'Por favor, insira um CPF válido!');
      return;
    }
    if (senha.length < 6) {
      setErrors({ ...newErrors, senha: true });
      Alert.alert('Senha Fraca', 'Sua senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      const tipo_perfil = isDriver ? 'driver' : 'passenger';
      const response = await api.post('/cadastro', {
        nome, email, cpf, senha, tipo_perfil,
        cnh: isDriver ? cnh : null,
        veiculo: isDriver ? { marca, modelo, placa, cor } : null,
      });
      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          'Cadastro realizado! ✅',
          'Agora é só entrar na sua conta.',
          [{ text: 'Ir para Login', onPress: () => router.replace('/login') }]
        );
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        Alert.alert(
          'Atenção ⚠️',
          'Este E-mail ou CPF já está cadastrado em nossa base. Tente fazer login ou use dados diferentes.'
        );
      } else {
        const errorMsg = error.response?.data?.error || 'Não foi possível completar o cadastro.';
        Alert.alert('Erro no Cadastro', errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#0F2417', '#2D5A27']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ChevronLeft size={24} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
        <Image
          source={require('../assets/images/divide_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <Text style={styles.headerSubtitle}>Junte-se à comunidade Divide em SC</Text>
      </LinearGradient>

      {/* Form Card */}
      <View style={styles.formCard}>

        {/* Dados Pessoais */}
        <Text style={styles.sectionLabel}>📋 Dados Pessoais</Text>

        <InputField
          icon={<User size={18} color="#AAB4B0" />}
          placeholder="Nome completo"
          value={nome}
          onChangeText={(v) => { setNome(v); setErrors({ ...errors, nome: false }); }}
          hasError={errors.nome}
        />
        <InputField
          icon={<Mail size={18} color="#AAB4B0" />}
          placeholder="E-mail"
          value={email}
          onChangeText={(v) => { setEmail(v); setErrors({ ...errors, email: false }); }}
          hasError={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <InputField
          icon={<CreditCard size={18} color="#AAB4B0" />}
          placeholder="CPF"
          value={cpf}
          onChangeText={(v) => { handleCpfChange(v); setErrors({ ...errors, cpf: false }); }}
          hasError={errors.cpf}
          keyboardType="numeric"
          maxLength={14}
        />
        <InputField
          icon={<Lock size={18} color="#AAB4B0" />}
          placeholder="Senha (mín. 6 caracteres)"
          value={senha}
          onChangeText={(v) => { setSenha(v); setErrors({ ...errors, senha: false }); }}
          hasError={errors.senha}
          secureTextEntry
        />

        {/* Driver Toggle */}
        <View style={styles.driverToggle}>
          <View style={styles.driverToggleText}>
            <Text style={styles.driverToggleTitle}>🚗 Quero ser Motorista</Text>
            <Text style={styles.driverToggleSub}>Oferecer caronas e gerar renda</Text>
          </View>
          <Switch
            value={isDriver}
            onValueChange={setIsDriver}
            trackColor={{ false: '#E0E0E0', true: theme.colors.primary }}
            thumbColor={isDriver ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Vehicle Section */}
        {isDriver && (
          <View style={styles.vehicleSection}>
            <LinearGradient
              colors={['#E8F5E9', '#F1F8F2']}
              style={styles.vehicleHeader}
            >
              <Car size={20} color={theme.colors.primary} />
              <Text style={styles.vehicleTitle}>Informações do Veículo</Text>
            </LinearGradient>

            <InputField
              icon={<CreditCard size={18} color="#AAB4B0" />}
              placeholder="Número da CNH"
              value={cnh}
              onChangeText={(v) => { setCnh(v); setErrors({ ...errors, cnh: false }); }}
              hasError={errors.cnh}
              keyboardType="numeric"
            />

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputField
                  icon={<Car size={16} color="#AAB4B0" />}
                  placeholder="Marca"
                  value={marca}
                  onChangeText={(v) => { setMarca(v); setErrors({ ...errors, marca: false }); }}
                  hasError={errors.marca}
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  icon={<Car size={16} color="#AAB4B0" />}
                  placeholder="Modelo"
                  value={modelo}
                  onChangeText={(v) => { setModelo(v); setErrors({ ...errors, modelo: false }); }}
                  hasError={errors.modelo}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={styles.halfInput}>
                <InputField
                  icon={<CreditCard size={16} color="#AAB4B0" />}
                  placeholder="Placa"
                  value={placa}
                  onChangeText={(v) => { setPlaca(v); setErrors({ ...errors, placa: false }); }}
                  hasError={errors.placa}
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.halfInput}>
                <InputField
                  icon={<Car size={16} color="#AAB4B0" />}
                  placeholder="Cor"
                  value={cor}
                  onChangeText={setCor}
                />
              </View>
            </View>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
          style={styles.submitOuter}
        >
          <LinearGradient
            colors={['#2D5A27', '#4A7C3A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <Text style={styles.submitText}>
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </Text>
            {!loading && <ArrowRight size={20} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
          <Text style={styles.loginText}>
            Já tem uma conta? <Text style={styles.loginTextBold}>Entrar</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 56,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 52,
    left: 20,
    padding: 8,
  },
  logo: {
    width: 120,
    height: 70,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    padding: 24,
    paddingTop: 32,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 6,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
    marginTop: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEE9',
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7F1',
  },
  inputError: {
    borderColor: theme.colors.error,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
  },
  driverToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F7F9F8',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#E8EEE9',
  },
  driverToggleText: {
    flex: 1,
  },
  driverToggleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  driverToggleSub: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  vehicleSection: {
    marginBottom: 20,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  vehicleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
  },
  submitOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.3,
  },
  loginLink: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  loginText: {
    color: theme.colors.gray,
    fontSize: 15,
  },
  loginTextBold: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
