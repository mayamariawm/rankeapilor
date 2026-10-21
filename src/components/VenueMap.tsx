import { router } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../lib/theme';
import type { Place } from '../lib/types';

// Centred between Miraflores and Barranco.
const REGION = { latitude: -12.1345, longitude: -77.0275, latitudeDelta: 0.06, longitudeDelta: 0.06 };

export function VenueMap({ places, scores }: { places: Place[]; scores: Record<string, number> }) {
  return (
    <MapView style={{ flex: 1 }} initialRegion={REGION} showsUserLocation>
      {places.map((p) => (
        <Marker
          key={p.id}
          coordinate={{ latitude: p.lat, longitude: p.lng }}
          title={p.name}
          description={scores[p.id] != null ? `Tu puntaje: ${scores[p.id].toFixed(1)}` : p.district}
          pinColor={p.isNew ? colors.primary : undefined}
          onCalloutPress={() => router.push(`/place/${p.id}`)}
        />
      ))}
    </MapView>
  );
}
