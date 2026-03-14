import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRole } from '../context/RoleContext';
import { theme } from '../constants/theme';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);

  const router = useRouter();
  const { setRole, setUser } = useRole();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos!');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ id: data.id, nome: data.nome, status: data.status });
        setRole(data.perfil);

        if (data.perfil === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('Falha no Login', data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0F2417', '#1B3A20', '#2D5A27']}
      style={styles.gradientBg}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/divide_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tagline}>O jeito inteligente de se mover em SC</Text>
        </View>

        {/* Card Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entrar na conta</Text>
          <Text style={styles.cardSubtitle}>Bem-vindo de volta!</Text>

          {/* Email Input */}
          <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
            <Mail size={20} color={emailFocused ? theme.colors.primary : '#AAB4B0'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Seu e-mail"
              placeholderTextColor="#AAB4B0"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Senha Input */}
          <View style={[styles.inputWrapper, senhaFocused && styles.inputWrapperFocused]}>
            <Lock size={20} color={senhaFocused ? theme.colors.primary : '#AAB4B0'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              placeholderTextColor="#AAB4B0"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              onFocus={() => setSenhaFocused(true)}
              onBlur={() => setSenhaFocused(false)}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
            style={styles.loginButtonOuter}
          >
            <LinearGradient
              colors={['#E67E22', '#D35400']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButton}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Entrar</Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Register Link */}
          <TouchableOpacity style={styles.registerLink} onPress={() => router.push('/register')}>
            <Text style={styles.registerText}>
              Novo por aqui?{' '}
              <Text style={styles.registerTextBold}>Crie sua conta</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Divide · Santa Catarina</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoWrapper: {
    width: 160,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 160,
    height: 100,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 15,
    color: theme.colors.gray,
    marginBottom: 28,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9F8',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8EEE9',
    marginBottom: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7F1',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  loginButtonOuter: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    elevation: 6,
    shadowColor: '#E67E22',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 22,
    alignItems: 'center',
  },
  registerText: {
    color: theme.colors.gray,
    fontSize: 15,
  },
  registerTextBold: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  footer: {
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    letterSpacing: 1,
  },
});
