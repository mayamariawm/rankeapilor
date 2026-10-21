import { Stack, router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Button, Chip, Row, ScoreBadge, placeSubtitle, styles } from '../../components/ui';
import { rankedList } from '../../lib/ranking';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function MyList() {
  const { state, placeById } = useStore();
  const [tab, setTab] = useState<'ranked' | 'saved'>('ranked');
  const ranked = rankedList(state.buckets);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerTitle: state.user ? `@${state.user.handle}` : 'Mi lista' }} />
      <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Chip label={`Rankeados (${ranked.length})`} active={tab === 'ranked'} onPress={() => setTab('ranked')} />
        <Chip label={`Quiero ir (${state.saved.length})`} active={tab === 'saved'} onPress={() => setTab('saved')} />
      </View>

      {tab === 'ranked' ? (
        <FlatList
          data={ranked}
          keyExtractor={(r) => r.placeId}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            ranked.length > 0 ? (
              <Button title="Compartir mi top" onPress={() => router.push('/share')} style={{ marginBottom: 12 }} />
            ) : undefined
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', gap: 12, marginTop: 40, paddingHorizontal: 24 }}>
              <Text style={[styles.h2, { textAlign: 'center' }]}>Tu lista está vacía</Text>
              <Text style={[styles.muted, { textAlign: 'center' }]}>
                Rankea el último café o restaurante al que fuiste. Toma 20 segundos.
              </Text>
              <Button title="Buscar un lugar" onPress={() => router.push('/')} />
            </View>
          }
          renderItem={({ item }) => {
            const place = placeById(item.placeId);
            if (!place) return null;
            return (
              <Row onPress={() => router.push(`/place/${place.id}`)}>
                <Text style={{ width: 28, color: colors.muted, fontWeight: '800', fontSize: 16 }}>{item.rank}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.body, { fontWeight: '700' }]} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <Text style={styles.muted}>{placeSubtitle(place)}</Text>
                </View>
                <ScoreBadge score={item.score} sentiment={item.sentiment} />
              </Row>
            );
          }}
        />
      ) : (
        <FlatList
          data={state.saved}
          keyExtractor={(id) => id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={[styles.muted, { textAlign: 'center', marginTop: 40 }]}>
              Guarda lugares con “Quiero ir” para no olvidarlos.
            </Text>
          }
          renderItem={({ item }) => {
            const place = placeById(item);
            if (!place) return null;
            return (
              <Row onPress={() => router.push(`/place/${place.id}`)}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.body, { fontWeight: '700' }]}>{place.name}</Text>
                  <Text style={styles.muted}>{placeSubtitle(place)}</Text>
                </View>
                <Pressable onPress={() => router.push(`/rank/${place.id}`)}>
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Ya fui</Text>
                </Pressable>
              </Row>
            );
          }}
        />
      )}
    </View>
  );
}
