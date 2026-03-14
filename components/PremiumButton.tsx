import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'action' | 'success' | 'badge';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'action', 
  style, 
  textStyle,
  icon 
}) => {
  const colors = theme.gradients[variant] || theme.gradients.action;
  const shadowColor = variant === 'action' ? theme.colors.secondary : theme.colors.primary;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[
        styles.buttonContainer, 
        { shadowColor },
        style
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
            {icon && icon}
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: {
    color: theme.colors.white,
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    textAlign: 'center'
  },
});
