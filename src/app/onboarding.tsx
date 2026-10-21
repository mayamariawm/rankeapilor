import { Redirect, router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, styles } from '../components/ui';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

const cleanHandle = (s: string) => s.toLowerCase().replace(/[^a-z0-9._]/g, '').slice(0, 24);

// Three steps: email, the 6-digit code Supabase emails, then name and @usuario.
// Someone who signed in before but never finished starts at the last step.
export default function Onboarding() {
  const { ready, signedIn, state, sendCode, verifyCode, createProfile } = useStore();
  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (action: () => Promise<string | null>, onSuccess?: () => void) => {
    setBusy(true);
    setError(null);
    const message = await action();
    setBusy(false);
    if (message) setError(message);
    else onSuccess?.();
  };

  if (state.user) return <Redirect href="/" />;
  if (signedIn && !ready) return <SafeAreaView style={styles.screen} />;

  let step: ReactStep;
  if (signedIn) {
    step = {
      fields: (
        <>
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
        </>
      ),
      button: 'Empezar',
      enabled: name.trim().length > 0 && handle.length >= 3,
      submit: () => run(() => createProfile(name.trim(), handle), () => router.replace('/')),
    };
  } else if (codeSent) {
    step = {
      fields: (
        <>
          <Text style={styles.muted}>Te enviamos un código a {email.trim()}.</Text>
          <TextInput
            style={styles.input}
            placeholder="Código de 6 dígitos"
            placeholderTextColor={colors.muted}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
          />
          <Text onPress={() => setCodeSent(false)} style={[styles.muted, { textDecorationLine: 'underline' }]}>
            Usar otro correo
          </Text>
        </>
      ),
      button: 'Ingresar',
      enabled: code.length === 6,
      submit: () => run(() => verifyCode(email, code)),
    };
  } else {
    step = {
      fields: (
        <TextInput
          style={styles.input}
          placeholder="Tu correo"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect={false}
        />
      ),
      button: 'Enviarme un código',
      enabled: /^\S+@\S+\.\S+$/.test(email.trim()),
      submit: () => run(() => sendCode(email), () => setCodeSent(true)),
    };
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 24, justifyContent: 'center', gap: 16 }}>
          <Text style={{ fontSize: 40, fontWeight: '900', color: colors.primary }}>Rankea</Text>
          <Text style={[styles.h2, { fontWeight: '600' }]}>
            Los cafés y restaurantes más lindos de Lima, rankeados por tus amigos.
          </Text>
          <Text style={styles.muted}>Piloto solo con invitación · Miraflores y Barranco</Text>

          <View style={{ gap: 10, marginTop: 16 }}>{step.fields}</View>
          {error ? <Text style={{ color: colors.primary }}>{error}</Text> : null}

          <Button title={step.button} disabled={busy || !step.enabled} onPress={step.submit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type ReactStep = { fields: ReactNode; button: string; enabled: boolean; submit: () => void };
