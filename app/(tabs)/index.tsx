import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRole } from '../../context/RoleContext';
import { theme } from '../../constants/theme';
import { PassengerDashboard } from '../../components/PassengerDashboard';
import { DriverDashboard } from '../../components/DriverDashboard';
import { AdminDashboard } from '../../components/AdminDashboard';

export default function HomeScreen() {
  const { role, user } = useRole();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {user && (
        <LinearGradient
          colors={theme.gradients.header as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.greetingContainer}
        >
          <View>
            <Text style={styles.greetingLabel}>Bem-vindo,</Text>
            <Text style={styles.greetingText}>{user.nome}!</Text>
          </View>
          <LinearGradient
             colors={theme.gradients.badge as [string, string, ...string[]]}
             style={styles.roleBadge}
          >
             <Text style={styles.roleBadgeText}>
                {role === 'driver' ? 'Motorista' : role === 'passenger' ? 'Passageiro' : 'Admin'}
             </Text>
          </LinearGradient>
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
    backgroundColor: theme.colors.background,
  },
  greetingContainer: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 8,
    shadowColor: '#2D5A27',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  greetingLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  roleBadgeText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
});
