import { Redirect } from 'expo-router';
import { useRole } from '../context/RoleContext';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user } = useRole();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1A237E" />
      </View>
    );
  }

  // If there's no user logged in, redirect to login
  if (!user) {
    return <Redirect href="/login" />;
  }

  // Otherwise, go to tabs
  return <Redirect href="/(tabs)" />;
}
