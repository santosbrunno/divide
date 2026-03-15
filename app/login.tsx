import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, Image, KeyboardAvoidingView, Platform, Animated, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useRole } from '../context/RoleContext';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [senhaFocused, setSenhaFocused] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const router = useRouter();
  const { setRole, setUser } = useRole();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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
        setUser({ 
          id: data.id, 
          nome: data.nome, 
          status: data.status,
          originalProfile: data.perfil 
        });
        setRole(data.perfil);
        if (data.perfil === 'admin') router.replace('/admin/dashboard');
        else router.replace('/(tabs)');
      } else {
        Alert.alert('Falha no Login', data.error || 'Credenciais inválidas');
      }
    } catch (error) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1A0D" />

      {/* Background gradient */}
      <LinearGradient colors={['#0A1A0D', '#0F2417', '#1B3A20']} style={StyleSheet.absoluteFill} />

      {/* Decorative orbs */}
      <Animated.View style={[styles.orb1, { transform: [{ translateY: floatAnim }] }]} />
      <Animated.View style={[styles.orb2, { transform: [{ translateY: Animated.multiply(floatAnim, -1) }] }]} />
      <View style={styles.orb3} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Logo area */}
          <View style={styles.logoArea}>
            <Image
              source={require('../assets/images/divide_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Caronas em Santa Catarina</Text>
          </View>

          {/* Glass Card */}
          <View style={styles.glassCard}>
            <Text style={styles.cardTitle}>Entrar na conta</Text>
            <Text style={styles.cardSubtitle}>Bem-vindo de volta 👋</Text>

            {/* Email */}
            <View style={[styles.inputWrapper, emailFocused && styles.inputFocused]}>
              <Mail size={18} color={emailFocused ? '#E67E22' : 'rgba(255,255,255,0.4)'} />
              <TextInput
                style={styles.input}
                placeholder="Seu e-mail"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Senha */}
            <View style={[styles.inputWrapper, senhaFocused && styles.inputFocused]}>
              <Lock size={18} color={senhaFocused ? '#E67E22' : 'rgba(255,255,255,0.4)'} />
              <TextInput
                style={styles.input}
                placeholder="Sua senha"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!showPass}
                onFocus={() => setSenhaFocused(true)}
                onBlur={() => setSenhaFocused(false)}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={{ padding: 4 }}>
                {showPass
                  ? <EyeOff size={16} color="rgba(255,255,255,0.4)" />
                  : <Eye size={16} color="rgba(255,255,255,0.4)" />
                }
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              <LinearGradient colors={['#E67E22', '#D35400']} style={styles.loginBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <>
                    <Text style={styles.loginBtnText}>Entrar</Text>
                    <ArrowRight size={20} color="#fff" />
                  </>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>ou</Text>
              <View style={styles.divider} />
            </View>

            {/* Register */}
            <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/register')} activeOpacity={0.8}>
              <Text style={styles.registerBtnText}>Criar conta grátis</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerText}>Divide · Mobilidade Catarinense 🌲</Text>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1A0D' },
  flex: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 24 },

  // Orbs
  orb1: {
    position: 'absolute', width: 280, height: 280, borderRadius: 140,
    backgroundColor: 'rgba(46,90,39,0.25)', top: -60, right: -80,
  },
  orb2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(230,126,34,0.12)', bottom: 80, left: -60,
  },
  orb3: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(46,90,39,0.15)', bottom: 200, right: 20,
  },

  // Logo
  logoArea: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 160, height: 80 },
  tagline: { color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 6, letterSpacing: 0.5 },

  // Glass card
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 },

  // Inputs
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, paddingHorizontal: 16,
    paddingVertical: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  inputFocused: { borderColor: '#E67E22', backgroundColor: 'rgba(230,126,34,0.08)' },
  input: { flex: 1, fontSize: 15, color: '#fff' },

  // Buttons
  loginBtn: {
    borderRadius: 16, paddingVertical: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 10,
    elevation: 8, shadowColor: '#E67E22', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 12, marginTop: 6,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  divider: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: { color: 'rgba(255,255,255,0.3)', fontSize: 13 },

  registerBtn: {
    borderRadius: 16, paddingVertical: 15, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  registerBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '700' },

  footerText: { textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12, marginTop: 32 },
});
