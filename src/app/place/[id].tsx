import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Image, Linking, ScrollView, Text, View } from 'react-native';
import { Button, NewTag, ScoreBadge, placeSubtitle, styles } from '../../components/ui';
import { DEMO_ACTIVITY } from '../../lib/demoFriends';
import { rankedList } from '../../lib/ranking';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';
import { SENTIMENT_LABELS } from '../../lib/types';

export default function PlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { placeById, state, toggleSaved, unrankPlace } = useStore();
  const place = placeById(id);
  if (!place) return <Text style={[styles.muted, { padding: 24 }]}>No encontramos este lugar.</Text>;

  const mine = rankedList(state.buckets).find((r) => r.placeId === place.id);
  const visit = state.visits[place.id];
  const saved = state.saved.includes(place.id);
  const friends = DEMO_ACTIVITY.filter((a) => a.placeId === place.id);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.district} Lima`)}`;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, gap: 18 }}>
      <Stack.Screen options={{ title: place.name }} />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={[styles.title, { flexShrink: 1 }]}>{place.name}</Text>
          {place.isNew && <NewTag />}
        </View>
        <Text style={styles.muted}>{placeSubtitle(place)}</Text>
      </View>

      {mine && visit ? (
        <View style={[styles.row, { marginBottom: 0 }]}>
          <ScoreBadge score={mine.score} sentiment={mine.sentiment} size={56} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[styles.body, { fontWeight: '700' }]}>
              #{mine.rank} en tu lista · {SENTIMENT_LABELS[mine.sentiment]}
            </Text>
            {visit.note ? <Text style={styles.body}>“{visit.note}”</Text> : null}
          </View>
        </View>
      ) : null}
      {visit?.photoUri ? (
        <Image source={{ uri: visit.photoUri }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: 14 }} />
      ) : null}

      <View style={{ gap: 10 }}>
        <Button title={mine ? 'Volver a rankear' : 'Lo visité: rankear'} onPress={() => router.push(`/rank/${place.id}`)} />
        {!mine && (
          <Button title={saved ? 'Guardado en Quiero ir' : 'Quiero ir'} kind="secondary" onPress={() => toggleSaved(place.id)} />
        )}
        <Button title="Abrir en Google Maps" kind="secondary" onPress={() => Linking.openURL(mapsUrl)} />
      </View>

      {friends.length > 0 && (
        <View style={{ gap: 8 }}>
          <Text style={styles.h2}>Tus amigos</Text>
          {friends.map((a) => (
            <View key={a.id} style={[styles.row, { marginBottom: 0 }]}>
              <ScoreBadge score={a.score} sentiment={a.sentiment} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.body, { fontWeight: '700' }]}>{a.friend}</Text>
                {a.note ? <Text style={styles.muted}>{a.note}</Text> : null}
              </View>
            </View>
          ))}
          <Text style={styles.muted}>Amigos de ejemplo hasta conectar el servidor.</Text>
        </View>
      )}

      {mine && (
        <Text
          onPress={() => unrankPlace(place.id)}
          style={{ color: colors.muted, textAlign: 'center', textDecorationLine: 'underline' }}
        >
          Quitar de mi lista
        </Text>
      )}
    </ScrollView>
  );
}
