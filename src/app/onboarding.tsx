import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, styles } from '../components/ui';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

const cleanHandle = (s: string) => s.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 24);

export default function Onboarding() {
  const { setUser } = useStore();
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const canContinue = name.trim().length > 0 && handle.length >= 3;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
          <Text style={{ fontSize: 40, fontWeight: '900', color: colors.primary }}>Rankea</Text>
          <Text style={[styles.h2, { fontWeight: '600' }]}>
            Los cafés y restaurantes más lindos de Lima, rankeados por tus amigos.
          </Text>
          <Text style={styles.muted}>Piloto solo con invitación · Miraflores y Barranco</Text>

          <View style={{ gap: 10, marginTop: 16 }}>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoComplete="name"
            />
            <TextInput
              style={styles.input}
              placeholder="@usuario"
              placeholderTextColor={colors.muted}
              value={handle ? `@${handle}` : ''}
              onChangeText={(t) => setHandle(cleanHandle(t))}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <Button
            title="Empezar"
            disabled={!canContinue}
            onPress={() => {
              setUser({ name: name.trim(), handle });
              router.replace('/');
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
