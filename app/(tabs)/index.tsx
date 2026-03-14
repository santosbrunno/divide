import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRole } from '../../context/RoleContext';
import { theme } from '../../constants/theme';
import { PassengerDashboard } from '../../components/PassengerDashboard';
import { DriverDashboard } from '../../components/DriverDashboard';
import { AdminDashboard } from '../../components/AdminDashboard';

export default function HomeScreen() {
  const { role, user } = useRole();

  const getRoleBadge = () => {
    if (role === 'driver') return { label: '🚗 Motorista', colors: ['#E67E22', '#D35400'] as [string, string] };
    if (role === 'admin') return { label: '⚙️ Admin', colors: ['#D4AF37', '#B8860B'] as [string, string] };
    return { label: '🧭 Passageiro', colors: ['#2980B9', '#1A5276'] as [string, string] };
  };

  const badge = getRoleBadge();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F2417" />

      {/* Header */}
      {user && (
        <LinearGradient
          colors={['#0F2417', '#1B3A20', '#2D5A27']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.greetingLabel}>Bem-vindo,</Text>
            <Text style={styles.greetingName} numberOfLines={1}>{user.nome} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <LinearGradient
              colors={badge.colors}
              style={styles.roleBadge}
            >
              <Text style={styles.roleBadgeText}>{badge.label}</Text>
            </LinearGradient>
            <Image
              source={require('../../assets/images/divide_logo.png')}
              style={styles.logoSmall}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      )}

      <View style={styles.content}>
        {role === 'passenger' && <PassengerDashboard />}
        {role === 'driver' && <DriverDashboard userId={user?.id} userStatus={user?.status} />}
        {role === 'admin' && <AdminDashboard />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 10,
    shadowColor: '#0F2417',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  greetingLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '400',
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  logoSmall: {
    width: 70,
    height: 36,
    opacity: 0.85,
  },
  content: {
    flex: 1,
  },
});
