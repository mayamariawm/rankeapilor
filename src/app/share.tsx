import * as Sharing from 'expo-sharing';
import { useRef, useState } from 'react';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';
import { Button, ScoreBadge, styles } from '../components/ui';
import { rankedList } from '../lib/ranking';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';

// A 9:16 card sized for Instagram Stories and TikTok: the share image is the
// main way rankings leave the app and pull new people in.
export default function ShareScreen() {
  const { state, placeById } = useStore();
  const shot = useRef<ViewShotRef>(null);
  const [busy, setBusy] = useState(false);
  const top = rankedList(state.buckets).slice(0, 5);

  const share = async () => {
    if (Platform.OS === 'web') return Alert.alert('Comparte desde la app en tu celular.');
    setBusy(true);
    try {
      const uri = await shot.current?.capture?.();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartir mi top' });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, gap: 16, alignItems: 'center' }}>
      <ViewShot ref={shot} options={{ format: 'png', quality: 1 }}>
        <View
          style={{
            width: 300,
            aspectRatio: 9 / 16,
            backgroundColor: colors.primary,
            borderRadius: 20,
            padding: 22,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ gap: 4 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', opacity: 0.85 }}>
              @{state.user?.handle}
            </Text>
            <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>Mi top de Lima</Text>
          </View>
          <View style={{ gap: 10 }}>
            {top.length === 0 && (
              <Text style={{ color: '#fff' }}>Rankea tu primer lugar para armar tu top.</Text>
            )}
            {top.map((r) => (
              <View
                key={r.placeId}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 12, padding: 10 }}
              >
                <Text style={{ fontWeight: '900', color: colors.primary, width: 18 }}>{r.rank}</Text>
                <Text style={{ flex: 1, fontWeight: '700', color: colors.ink }} numberOfLines={1}>
                  {placeById(r.placeId)?.name}
                </Text>
                <ScoreBadge score={r.score} sentiment={r.sentiment} size={34} />
              </View>
            ))}
          </View>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>Rankea · Lima</Text>
        </View>
      </ViewShot>
      <Button title={busy ? 'Preparando…' : 'Compartir imagen'} onPress={share} disabled={busy || top.length === 0} style={{ alignSelf: 'stretch' }} />
    </ScrollView>
  );
}
