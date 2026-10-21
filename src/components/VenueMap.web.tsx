import { Text, View } from 'react-native';
import { styles } from './ui';
import type { Place } from '../lib/types';

// react-native-maps has no web build; the web preview only exists for quick checks.
export function VenueMap(_: { places: Place[]; scores: Record<string, number> }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={styles.muted}>El mapa se ve en la app de iPhone y Android.</Text>
    </View>
  );
}
