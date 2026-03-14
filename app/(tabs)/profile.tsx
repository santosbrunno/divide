import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { User, Shield, Briefcase, ChevronRight, LogOut } from 'lucide-react-native';
import { useRole, UserRole } from '../../context/RoleContext';
import { theme } from '../../constants/theme';

export default function ProfileScreen() {
  const { role, setRole } = useRole();

  const RoleOption = ({ targetRole, label, icon: Icon, description }: { 
    targetRole: UserRole, 
    label: string, 
    icon: any,
    description: string 
  }) => (
    <TouchableOpacity 
      style={[
        styles.roleCard, 
        role === targetRole && styles.activeRoleCard
      ]} 
      onPress={() => setRole(targetRole)}
    >
      <View style={styles.roleIconWrapper}>
        <Icon size={24} color={role === targetRole ? theme.colors.primary : theme.colors.gray} />
      </View>
      <View style={styles.roleTextContainer}>
        <Text style={[styles.roleLabel, role === targetRole && styles.activeRoleLabel]}>{label}</Text>
        <Text style={styles.roleDescription}>{description}</Text>
      </View>
      {role === targetRole && <View style={styles.activeDot} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <User size={40} color={theme.colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.userName}>Bruno Soares</Text>
          <Text style={styles.userRoleText}>
            Atuando como: {role.charAt(0).toUpperCase() + role.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Alternar Modo de Uso</Text>
        <RoleOption 
          targetRole="passenger" 
          label="Passageiro" 
          icon={User} 
          description="Buscar e reservar caronas em Santa Catarina."
        />
        <RoleOption 
          targetRole="driver" 
          label="Motorista" 
          icon={Briefcase} 
          description="Oferecer caronas e gerenciar suas rotas."
        />
        <RoleOption 
          targetRole="admin" 
          label="Administrador" 
          icon={Shield} 
          description="Acompanhar lucros e estatísticas da plataforma."
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Editar Perfil</Text>
          <ChevronRight size={20} color={theme.colors.gray} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={[styles.settingText, { color: theme.colors.error }]}>Sair da Conta</Text>
          <LogOut size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.versionText}>Divide App v2.0 - Expo Router</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  userRoleText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  activeRoleCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F2FF',
  },
  roleIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  activeRoleLabel: {
    color: theme.colors.primary,
  },
  roleDescription: {
    fontSize: 12,
    color: theme.colors.gray,
    marginTop: 2,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  footer: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.gray,
  },
});
