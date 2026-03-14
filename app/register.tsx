import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { theme } from '../constants/theme';
import { PremiumButton } from '../components/PremiumButton';

// Helper CPF Functions
function isValidCpf(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;
  let soma = 0, resto;
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
  const [errors, setErrors] = useState<{[key: string]: boolean}>({});
  
  const router = useRouter();

  const handleCpfChange = (value: string) => {
    setCpf(maskCpf(value));
  };

  const handleRegister = async () => {
    let newErrors: {[key: string]: boolean} = {};

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
      Alert.alert('Erro', 'Por favor, preencha todos os campos destacados.');
      return;
    }

    if (!isValidCpf(cpf)) {
      setErrors({ ...newErrors, cpf: true });
      Alert.alert('Erro no CPF', 'Por favor, insira um CPF válido!');
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
        nome, 
        email, 
        cpf, 
        senha, 
        tipo_perfil, 
        cnh: isDriver ? cnh : null,
        veiculo: isDriver ? { marca, modelo, placa, cor } : null
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert(
          'Sucesso! ✅', 
          'Seu cadastro foi realizado com sucesso!',
          [{ text: 'Ir para Login', onPress: () => router.replace('/login') }]
        );
      }
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      const errorMsg = error.response?.data?.error || 'Não foi possível completar o cadastro.';
      Alert.alert('Erro no Cadastro', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Criar Conta</Text>
      <Text style={styles.subtitle}>Comece a economizar em suas viagens hoje!</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.nome && styles.inputError]}
          placeholder="Nome Completo"
          placeholderTextColor="#999"
          value={nome}
          onChangeText={(v) => { setNome(v); setErrors({...errors, nome: false}); }}
        />
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="E-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={(v) => { setEmail(v); setErrors({...errors, email: false}); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, errors.cpf && styles.inputError]}
          placeholder="CPF"
          placeholderTextColor="#999"
          value={cpf}
          onChangeText={(v) => { handleCpfChange(v); setErrors({...errors, cpf: false}); }}
          keyboardType="numeric"
          maxLength={14}
        />
        <TextInput
          style={[styles.input, errors.senha && styles.inputError]}
          placeholder="Senha (mín. 6 caracteres)"
          placeholderTextColor="#999"
          value={senha}
          onChangeText={(v) => { setSenha(v); setErrors({...errors, senha: false}); }}
          secureTextEntry
        />
      </View>

      <View style={styles.switchContainer}>
        <View>
            <Text style={styles.switchLabel}>Modo Motorista</Text>
            <Text style={styles.switchSubLabel}>Quero oferecer caronas</Text>
        </View>
        <Switch
          value={isDriver}
          onValueChange={setIsDriver}
          trackColor={{ false: '#ccc', true: theme.colors.primary }}
          thumbColor={isDriver ? theme.colors.white : '#f4f3f4'}
        />
      </View>

      {isDriver && (
        <View style={{ gap: 16, marginBottom: 32 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginTop: 8 }}>Sobre seu Veículo</Text>
          <TextInput
            style={[styles.input, errors.cnh && styles.inputError]}
            placeholder="Número da CNH"
            placeholderTextColor="#999"
            value={cnh}
            onChangeText={(v) => { setCnh(v); setErrors({...errors, cnh: false}); }}
            keyboardType="numeric"
          />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              style={[styles.input, { flex: 1 }, errors.marca && styles.inputError]}
              placeholder="Marca"
              placeholderTextColor="#999"
              value={marca}
              onChangeText={(v) => { setMarca(v); setErrors({...errors, marca: false}); }}
            />
            <TextInput
              style={[styles.input, { flex: 1 }, errors.modelo && styles.inputError]}
              placeholder="Modelo"
              placeholderTextColor="#999"
              value={modelo}
              onChangeText={(v) => { setModelo(v); setErrors({...errors, modelo: false}); }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TextInput
              style={[styles.input, { flex: 1 }, errors.placa && styles.inputError]}
              placeholder="Placa"
              placeholderTextColor="#999"
              value={placa}
              onChangeText={(v) => { setPlaca(v); setErrors({...errors, placa: false}); }}
              autoCapitalize="characters"
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Cor"
              placeholderTextColor="#999"
              value={cor}
              onChangeText={setCor}
            />
          </View>
        </View>
      )}

      <PremiumButton 
        title={loading ? "Cadastrando..." : "Finalizar Cadastro"} 
        onPress={handleRegister}
        variant="success"
        style={{ marginBottom: 20 }}
      />

      <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/login')}>
        <Text style={styles.loginText}>Já tem uma conta? <Text style={styles.loginTextBold}>Entrar</Text></Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.gray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#eee',
    color: theme.colors.text,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 1.5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  switchLabel: {
    fontSize: 17,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  switchSubLabel: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  loginLink: {
    marginTop: 10,
    marginBottom: 40,
    alignItems: 'center',
  },
  loginText: {
    color: theme.colors.gray,
    fontSize: 16,
  },
  loginTextBold: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
