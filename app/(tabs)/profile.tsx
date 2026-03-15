import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Shield, Briefcase, ChevronRight, LogOut, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRole, UserRole } from '../../context/RoleContext';
import { theme } from '../../constants/theme';

export default function ProfileScreen() {
  const { role, setRole, user, setUser } = useRole();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const RoleOption = ({ targetRole, label, icon: Icon, description, gradient }: {
    targetRole: UserRole; label: string; icon: any; description: string; gradient: [string, string];
  }) => {
    const isActive = role === targetRole;
    return (
      <TouchableOpacity
        style={[styles.roleCard, isActive && styles.activeRoleCard]}
        onPress={() => setRole(targetRole)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isActive ? gradient : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
          style={styles.roleIconWrapper}
        >
          <Icon size={22} color={isActive ? '#fff' : 'rgba(255,255,255,0.4)'} />
        </LinearGradient>
        <View style={styles.roleTextContainer}>
          <Text style={[styles.roleLabel, isActive && styles.activeRoleLabel]}>{label}</Text>
          <Text style={styles.roleDescription}>{description}</Text>
        </View>
        {isActive && (
          <LinearGradient colors={['#E67E22', '#D35400']} style={styles.activeDot}>
            <Star size={10} color="#fff" />
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  };

  const initials = user?.nome
    ? user.nome.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleLogout = () => {
    setRole('passenger');
    setUser(null);
    router.replace('/login');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1A0D" />
      <LinearGradient colors={['#0A1A0D', '#0F2417', '#1B3A20']} style={StyleSheet.absoluteFill} />

      {/* Decorative orb */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Header */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/divide_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Avatar */}
            <LinearGradient colors={['#E67E22', '#D35400']} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>

            <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
            <Text style={styles.userRole}>
              {role === 'driver' ? '🚗 Motorista' : role === 'admin' ? '⚙️ Administrador' : '🧭 Passageiro'} · Divide SC
            </Text>

            {/* Stats pills */}
            <View style={styles.statsPills}>
              <View style={styles.pill}>
                <Text style={styles.pillEmoji}>🌲</Text>
                <Text style={styles.pillText}>Santa Catarina</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillEmoji}>✅</Text>
                <Text style={styles.pillText}>{user?.status === 'aprovado' ? 'Aprovado' : 'Verificado'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>

            {/* Role Switch */}
            <Text style={styles.sectionTitle}>Trocar Modo de Uso</Text>
            <View style={styles.glassSection}>
              <RoleOption
                targetRole="passenger"
                label="Passageiro"
                icon={User}
                description="Buscar e reservar caronas"
                gradient={['#2D5A27', '#4A7C3A']}
              />
              <View style={styles.sep} />
              <RoleOption
                targetRole="driver"
                label="Motorista"
                icon={Briefcase}
                description="Oferecer caronas e ganhar"
                gradient={['#E67E22', '#D35400']}
              />
              
              {user?.originalProfile === 'admin' && (
                <>
                  <View style={styles.sep} />
                  <RoleOption
                    targetRole="admin"
                    label="Administrador"
                    icon={Shield}
                    description="Painel de controle"
                    gradient={['#D4AF37', '#B8860B']}
                  />
                </>
              )}
            </View>

            {/* Menu Items */}
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.glassSection}>
              <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/trips')}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(46,90,39,0.3)' }]}>
                  <Text style={styles.menuIconEmoji}>🗺️</Text>
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>Minhas Reservas</Text>
                  <Text style={styles.menuSub}>Ver histórico de viagens</Text>
                </View>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>

              <View style={styles.sep} />

              <TouchableOpacity style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: 'rgba(212,175,55,0.2)' }]}>
                  <Text style={styles.menuIconEmoji}>⭐</Text>
                </View>
                <View style={styles.menuText}>
                  <Text style={styles.menuTitle}>Avaliações</Text>
                  <Text style={styles.menuSub}>Ver feedbacks recebidos</Text>
                </View>
                <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} style={styles.logoutWrap}>
              <LinearGradient colors={['rgba(163,38,38,0.3)', 'rgba(163,38,38,0.15)']} style={styles.logoutBtn}>
                <LogOut size={18} color="#FF6B6B" />
                <Text style={styles.logoutText}>Sair da conta</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.versionText}>Divide v1.0 · 2025 · Todos os direitos reservados</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A1A0D' },
  orb1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(46,90,39,0.2)', top: -100, right: -80,
  },
  orb2: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(230,126,34,0.1)', top: 200, left: -60,
  },

  // Header
  header: {
    alignItems: 'center', paddingTop: 60, paddingBottom: 32,
    paddingHorizontal: 24, position: 'relative',
  },
  logo: { width: 90, height: 45, opacity: 0.6, marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center',
    elevation: 10, shadowColor: '#E67E22', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, marginBottom: 14,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  userName: { fontSize: 22, fontWeight: '900', color: '#fff', marginBottom: 4 },
  userRole: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 20 },
  statsPills: { flexDirection: 'row', gap: 10 },
  pill: {
    flexDirection: 'row', gap: 6, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  pillEmoji: { fontSize: 13 },
  pillText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },

  // Content
  content: { paddingHorizontal: 20, paddingBottom: 48 },
  sectionTitle: {
    color: 'rgba(255,255,255,0.35)', fontSize: 11, fontWeight: '700', letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 10, marginTop: 24, marginLeft: 4,
  },

  // Glass sections
  glassSection: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 16 },

  // Role cards
  roleCard: {
    flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
  },
  activeRoleCard: { backgroundColor: 'rgba(255,255,255,0.04)' },
  roleIconWrapper: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  roleTextContainer: { flex: 1 },
  roleLabel: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.5)', marginBottom: 2 },
  activeRoleLabel: { color: '#fff' },
  roleDescription: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  activeDot: { width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  // Menu
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuIconEmoji: { fontSize: 18 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  menuSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },

  // Logout
  logoutWrap: { marginTop: 24 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 16, paddingVertical: 16, borderWidth: 1, borderColor: 'rgba(163,38,38,0.3)',
  },
  logoutText: { color: '#FF6B6B', fontSize: 15, fontWeight: '700' },

  versionText: {
    textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 11, marginTop: 32, marginBottom: 8,
  },
});
