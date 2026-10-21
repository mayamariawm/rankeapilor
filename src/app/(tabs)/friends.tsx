import { router } from 'expo-router';
import { FlatList, Share, Text, View } from 'react-native';
import { Button, Row, ScoreBadge, styles } from '../../components/ui';
import { DEMO_ACTIVITY } from '../../lib/demoFriends';
import { useStore } from '../../lib/store';
import { colors } from '../../lib/theme';

const ago = (h: number) => (h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`);

export default function Friends() {
  const { placeById, state } = useStore();

  const invite = () =>
    Share.share({
      message: `Estoy rankeando los cafés y restaurantes más lindos de Lima en Rankea. Únete al piloto con mi invitación: @${state.user?.handle}`,
    });

  return (
    <FlatList
      style={styles.screen}
      data={DEMO_ACTIVITY}
      keyExtractor={(a) => a.id}
      contentContainerStyle={{ padding: 16 }}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 16 }}>
          <Button title="Invitar amigos" onPress={invite} />
          <Text style={styles.muted}>Actividad de ejemplo hasta conectar el servidor de amigos.</Text>
        </View>
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
                {place.district} · {ago(item.hoursAgo)}
              </Text>
            </View>
            <ScoreBadge score={item.score} sentiment={item.sentiment} />
          </Row>
        );
      }}
    />
  );
}
