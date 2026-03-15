import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRole } from '../../context/RoleContext';
import { theme } from '../../constants/theme';
import { PassengerDashboard } from '../../components/PassengerDashboard';
import { DriverDashboard } from '../../components/DriverDashboard';
import { AdminDashboard } from '../../components/AdminDashboard';

export default function HomeScreen() {
  const { role, user } = useRole();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [role]);

  const getRoleBadge = () => {
    if (role === 'driver') return { label: '🚗 Motorista', colors: ['#E67E22', '#D35400'] as [string, string] };
    if (role === 'admin') return { label: '⚙️ Admin', colors: ['#D4AF37', '#B8860B'] as [string, string] };
    return { label: '🧭 Passageiro', colors: ['#2D5A27', '#4A7C3A'] as [string, string] };
  };

  const badge = getRoleBadge();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1A0D" />
      <LinearGradient colors={['#0A1A0D', '#0F2417']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greetingLabel}>Bem-vindo,</Text>
            <Text style={styles.greetingName} numberOfLines={1}>{user?.nome || 'Usuário'} 👋</Text>
          </View>
          
          <View style={styles.headerRight}>
             <Image
              source={require('../../assets/images/divide_logo.png')}
              style={styles.logoSmall}
              resizeMode="contain"
            />
            <LinearGradient
              colors={badge.colors}
              start={{x:0, y:0}} end={{x:1, y:1}}
              style={styles.roleBadge}
            >
              <Text style={styles.roleBadgeText}>{badge.label}</Text>
            </LinearGradient>
          </View>
        </LinearGradient>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {role === 'passenger' && <PassengerDashboard />}
          {role === 'driver' && <DriverDashboard userId={user?.id} userStatus={user?.status} />}
          {role === 'admin' && <AdminDashboard />}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1A0D' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: { flex: 1 },
  headerRight: { alignItems: 'flex-end', gap: 6 },
  greetingLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  greetingName: {
    fontSize: 19,
    fontWeight: '900',
    color: '#fff',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  logoSmall: {
    width: 60,
    height: 30,
    opacity: 0.8,
  },
  content: { flex: 1 },
});
