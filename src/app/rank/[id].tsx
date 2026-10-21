import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Button, ScoreBadge, placeSubtitle, styles } from '../../components/ui';
import {
  SENTIMENTS,
  answer,
  insertPlace,
  pivotIndex,
  removePlace,
  scoreFor,
  startComparison,
  type Comparison,
  type Sentiment,
} from '../../lib/ranking';
import { useStore } from '../../lib/store';
import { colors, radius, sentimentColor } from '../../lib/theme';
import { SENTIMENT_LABELS, type Place } from '../../lib/types';

type Step =
  | { kind: 'feel' }
  | { kind: 'compare'; sentiment: Sentiment; bucket: string[]; c: Comparison }
  | { kind: 'done'; sentiment: Sentiment; index: number };

const EMOJI: Record<Sentiment, string> = { loved: '😍', fine: '🙂', disliked: '😕' };

export default function RankScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { placeById, state, rankPlace } = useStore();
  const place = placeById(id);
  const [step, setStep] = useState<Step>({ kind: 'feel' });
  const [note, setNote] = useState(state.visits[id]?.note ?? '');
  const [photoUri, setPhotoUri] = useState(state.visits[id]?.photoUri);

  if (!place) return null;

  const choose = (sentiment: Sentiment) => {
    // Compare against the user's other places in that bucket, never against itself.
    const bucket = removePlace(state.buckets, place.id)[sentiment];
    const c = startComparison(bucket);
    if (!c) return finish(sentiment, 0);
    setStep({ kind: 'compare', sentiment, bucket, c });
  };

  const finish = (sentiment: Sentiment, index: number) => {
    rankPlace({ placeId: place.id, sentiment, index, note: note.trim() || undefined, photoUri });
    setStep({ kind: 'done', sentiment, index });
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  };

  if (step.kind === 'compare') {
    const other = placeById(step.bucket[pivotIndex(step.c)]);
    const onAnswer = (newIsBetter: boolean) => {
      const next = answer(step.c, newIsBetter);
      if (typeof next === 'number') finish(step.sentiment, next);
      else setStep({ ...step, c: next });
    };
    return (
      <View style={[styles.screen, { padding: 20, gap: 16 }]}>
        <Text style={styles.title}>¿Cuál te gustó más?</Text>
        <Text style={styles.muted}>Toca el que prefieres. Son solo unas pocas preguntas.</Text>
        <CompareCard place={place} onPress={() => onAnswer(true)} />
        <Text style={[styles.muted, { textAlign: 'center', fontWeight: '700' }]}>o</Text>
        {other && <CompareCard place={other} onPress={() => onAnswer(false)} />}
      </View>
    );
  }

  if (step.kind === 'done') {
    const buckets = insertPlace(removePlace(state.buckets, place.id), step.sentiment, step.index, place.id);
    const score = scoreFor(buckets, place.id) ?? 0;
    return (
      <View style={[styles.screen, { padding: 24, gap: 20, alignItems: 'center', justifyContent: 'center' }]}>
        <ScoreBadge score={score} sentiment={step.sentiment} size={110} />
        <Text style={[styles.title, { textAlign: 'center' }]}>{place.name}</Text>
        <Text style={[styles.body, { textAlign: 'center' }]}>
          Quedó en tu lista con {score.toFixed(1)}. ¡Compártelo!
        </Text>
        <View style={{ alignSelf: 'stretch', gap: 10 }}>
          <Button title="Compartir mi lista" onPress={() => router.replace('/share')} />
          <Button title="Listo" kind="secondary" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Text style={styles.title}>{place.name}</Text>
        <Text style={styles.muted}>{placeSubtitle(place)}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Una línea: ¿qué pediste? ¿qué tal?"
        placeholderTextColor={colors.muted}
        value={note}
        onChangeText={setNote}
        maxLength={120}
      />
      <Pressable onPress={pickPhoto} style={[styles.input, { alignItems: 'center' }]}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: '100%', aspectRatio: 4 / 3, borderRadius: radius }} />
        ) : (
          <Text style={{ color: colors.primary, fontWeight: '700' }}>+ Agregar una foto (opcional)</Text>
        )}
      </Pressable>
      <Text style={[styles.h2, { marginTop: 8 }]}>¿Qué tal estuvo?</Text>
      {SENTIMENTS.map((s) => (
        <Pressable
          key={s}
          onPress={() => choose(s)}
          style={({ pressed }) => [
            styles.row,
            { borderWidth: 2, borderColor: sentimentColor[s], marginBottom: 0 },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={{ fontSize: 28 }}>{EMOJI[s]}</Text>
          <Text style={[styles.h2, { color: sentimentColor[s] }]}>{SENTIMENT_LABELS[s]}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function CompareCard({ place, onPress }: { place: Place; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { padding: 24, borderWidth: 2, borderColor: colors.line, marginBottom: 0 },
        pressed && { borderColor: colors.primary },
      ]}
    >
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={[styles.h2, { fontSize: 20 }]}>{place.name}</Text>
        <Text style={styles.muted}>{placeSubtitle(place)}</Text>
      </View>
    </Pressable>
  );
}
