import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Share, Text, TextInput, View } from 'react-native';
import { Button, Row, ScoreBadge, styles } from '../../components/ui';
import { ago, followHandle, useFriendFeed } from '../../lib/friends';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

export default function Friends() {
  const { placeById, state } = useStore();
  const { items, loading, refresh } = useFriendFeed();
  const [handle, setHandle] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const invite = () =>
    Share.share({
      message: `Estoy rankeando los cafés y restaurantes más lindos de Lima en Rankea. Únete al piloto y sígueme: @${state.user?.handle}`,
    });

  const follow = async () => {
    const error = await followHandle(handle);
    setMessage(error ?? `Ahora sigues a @${handle.replace(/^@/, '')}.`);
    if (!error) {
      setHandle('');
      refresh();
    }
  };

  return (
    <FlatList
      style={styles.screen}
      data={items}
      keyExtractor={(a) => a.id}
      contentContainerStyle={{ padding: 16 }}
      refreshing={loading}
      onRefresh={refresh}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 16 }}>
          <Button title="Invitar amigos" onPress={invite} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Seguir a @usuario"
              placeholderTextColor={colors.muted}
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={follow}
            />
            <Button title="Seguir" kind="secondary" onPress={follow} disabled={handle.replace(/^@/, '').length < 3} />
          </View>
          {message ? <Text style={styles.muted}>{message}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        loading ? undefined : (
          <Text style={styles.muted}>Sigue a tus amigos por su @usuario para ver lo que rankean.</Text>
        )
      }
      renderItem={({ item }) => {
        const place = placeById(item.placeId);
        if (!place) return null;
        return (
          <Row onPress={() => router.push(`/place/${place.id}`)}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.body}>
                <Text style={{ fontWeight: '700' }}>{item.friend}</Text> rankeó{' '}
                <Text style={{ fontWeight: '700', color: colors.primary }}>{place.name}</Text>
              </Text>
              {item.note ? <Text style={styles.body}>“{item.note}”</Text> : null}
              <Text style={styles.muted}>
                {place.district} · {ago(item.date)}
              </Text>
            </View>
            <ScoreBadge score={item.score} sentiment={item.sentiment} />
          </Row>
        );
      }}
    />
  );
}
