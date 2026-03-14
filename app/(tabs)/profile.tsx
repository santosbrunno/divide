import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Shield, Briefcase, ChevronRight, LogOut, Settings } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRole, UserRole } from '../../context/RoleContext';
import { theme } from '../../constants/theme';

export default function ProfileScreen() {
  const { role, setRole, user, setUser } = useRole();
  const router = useRouter();

  const RoleOption = ({ targetRole, label, icon: Icon, description, gradient }: {
    targetRole: UserRole;
    label: string;
    icon: any;
    description: string;
    gradient: [string, string];
  }) => {
    const isActive = role === targetRole;
    return (
      <TouchableOpacity
        style={[styles.roleCard, isActive && styles.activeRoleCard]}
        onPress={() => setRole(targetRole)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isActive ? gradient : ['#F5F7F6', '#EAEEED']}
          style={styles.roleIconWrapper}
        >
          <Icon size={22} color={isActive ? '#fff' : theme.colors.gray} />
        </LinearGradient>
        <View style={styles.roleTextContainer}>
          <Text style={[styles.roleLabel, isActive && styles.activeRoleLabel]}>{label}</Text>
          <Text style={styles.roleDescription}>{description}</Text>
        </View>
        {isActive && (
          <View style={styles.activeDot} />
        )}
      </TouchableOpacity>
    );
  };

  const initials = user?.nome
    ? user.nome.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Profile Header */}
      <LinearGradient
        colors={['#0F2417', '#1B3A20', '#2D5A27']}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <LinearGradient
            colors={['#E67E22', '#D35400']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarBadgeText}>
              {role === 'driver' ? '🚗' : role === 'admin' ? '⚙️' : '🧭'}
            </Text>
          </View>
        </View>
        <Text style={styles.userName}>{user?.nome || 'Usuário'}</Text>
        <Text style={styles.userRole}>
          {role === 'driver' ? 'Motorista' : role === 'admin' ? 'Administrador' : 'Passageiro'} · Divide SC
        </Text>
        <Image
          source={require('../../assets/images/divide_logo.png')}
          style={styles.logoSmall}
          resizeMode="contain"
        />
      </LinearGradient>

      {/* Role Switch */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alternar Modo de Uso</Text>
        <RoleOption
          targetRole="passenger"
          label="Passageiro"
          icon={User}
          description="Buscar e reservar caronas em Santa Catarina."
          gradient={['#2980B9', '#1A5276']}
        />
        <RoleOption
          targetRole="driver"
          label="Motorista"
          icon={Briefcase}
          description="Oferecer caronas e gerenciar suas rotas."
          gradient={['#2D5A27', '#4A7C3A']}
        />
        {role === 'admin' && (
          <RoleOption
            targetRole="admin"
            label="Administrador"
            icon={Shield}
            description="Acompanhar lucros e estatísticas da plataforma."
            gradient={['#D4AF37', '#B8860B']}
          />
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <View style={styles.settingsCard}>
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconWrapper}>
              <User size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.settingText}>Editar Perfil</Text>
            <ChevronRight size={18} color={theme.colors.gray} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingIconWrapper}>
              <Settings size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.settingText}>Preferências</Text>
            <ChevronRight size={18} color={theme.colors.gray} />
          </TouchableOpacity>

          <View style={styles.settingDivider} />

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              setUser(null);
              setRole('passenger');
              router.replace('/login');
            }}
          >
            <View style={[styles.settingIconWrapper, { backgroundColor: '#FFF0F0' }]}>
              <LogOut size={18} color={theme.colors.error} />
            </View>
            <Text style={[styles.settingText, { color: theme.colors.error }]}>Sair da Conta</Text>
            <ChevronRight size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>Divide App · Santa Catarina</Text>
        <Text style={styles.versionNum}>v2.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '800',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarBadgeText: {
    fontSize: 14,
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.3,
  },
  userRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  logoSmall: {
    width: 80,
    height: 42,
    opacity: 0.4,
    marginTop: 16,
  },
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 12,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#EAEEED',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  activeRoleCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7F1',
  },
  roleIconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
  },
  activeRoleLabel: {
    color: theme.colors.primary,
  },
  roleDescription: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
    lineHeight: 16,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    marginLeft: 8,
  },
  settingsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  settingDivider: {
    height: 1,
    backgroundColor: '#F0F4F1',
    marginHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    padding: 24,
    marginTop: 8,
  },
  versionText: {
    fontSize: 13,
    color: theme.colors.gray,
    fontWeight: '500',
  },
  versionNum: {
    fontSize: 11,
    color: '#C0C8C2',
    marginTop: 2,
  },
});
