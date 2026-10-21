import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { VenueMap } from '../../components/VenueMap';
import { Chip, NewTag, Row, ScoreBadge, placeSubtitle, styles } from '../../components/ui';
import { rankedList } from '../../lib/ranking';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';
import { CATEGORY_LABELS, type Category, type District } from '../../lib/types';

type Filter = 'all' | 'new' | Category;

export default function Discover() {
  const { places, state } = useStore();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [district, setDistrict] = useState<District | 'all'>('all');
  const [view, setView] = useState<'list' | 'map'>('list');

  const ranked = useMemo(() => rankedList(state.buckets), [state.buckets]);
  const mine = useMemo(() => new Map(ranked.map((r) => [r.placeId, r])), [ranked]);
  const scores = useMemo(() => Object.fromEntries(ranked.map((r) => [r.placeId, r.score])), [ranked]);

  const shown = places
    .filter((p) => district === 'all' || p.district === district)
    .filter((p) => filter === 'all' || (filter === 'new' ? p.isNew : p.category === filter))
    .filter((p) => p.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew) || a.name.localeCompare(b.name));

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'new', label: 'Nuevos' },
    ...(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => ({ key: c, label: CATEGORY_LABELS[c] })),
  ];

  return (
    <View style={styles.screen}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Buscar un lugar"
            placeholderTextColor={colors.muted}
            value={query}
            onChangeText={setQuery}
          />
          <Pressable
            accessibilityLabel={view === 'list' ? 'Ver mapa' : 'Ver lista'}
            onPress={() => setView(view === 'list' ? 'map' : 'list')}
            style={[styles.input, { justifyContent: 'center' }]}
          >
            <Ionicons name={view === 'list' ? 'map-outline' : 'list-outline'} size={22} color={colors.primary} />
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(['all', 'Miraflores', 'Barranco'] as const).map((d) => (
            <Chip key={d} label={d === 'all' ? 'Toda Lima' : d} active={district === d} onPress={() => setDistrict(d)} />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {filters.map((f) => (
            <Chip key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </ScrollView>
      </View>

      {view === 'map' ? (
        <VenueMap places={shown} scores={scores} />
      ) : (
        <FlatList
          data={shown}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, paddingTop: 4 }}
          ListEmptyComponent={
            <Text style={[styles.muted, { textAlign: 'center', marginTop: 24 }]}>
              {filter === 'new' ? 'Todavía no hay lugares marcados como nuevos.' : 'No encontramos ese lugar.'}
            </Text>
          }
          ListFooterComponent={
            <Pressable onPress={() => router.push('/add-place')} style={{ padding: 16, alignItems: 'center' }}>
              <Text style={{ color: colors.primary, fontWeight: '700' }}>¿Falta un lugar? Agrégalo</Text>
            </Pressable>
          }
          renderItem={({ item }) => {
            const r = mine.get(item.id);
            return (
              <Row onPress={() => router.push(`/place/${item.id}`)}>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={[styles.body, { fontWeight: '700', flexShrink: 1 }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.isNew && <NewTag />}
                  </View>
                  <Text style={styles.muted}>{placeSubtitle(item)}</Text>
                </View>
                {r ? (
                  <ScoreBadge score={r.score} sentiment={r.sentiment} />
                ) : state.saved.includes(item.id) ? (
                  <Ionicons name="bookmark" size={22} color={colors.primary} />
                ) : null}
              </Row>
            );
          }}
        />
      )}
    </View>
  );
}
