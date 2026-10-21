import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { Button, Chip, styles } from '../components/ui';
import { useStore } from '../lib/store';
import { colors } from '../lib/theme';
import { CATEGORY_SINGULAR, type Category, type District } from '../lib/types';

// Pins for user-added places default to the district centre until the team
// reviews them; the review list is the "verified: false" places.
const CENTRE: Record<District, { lat: number; lng: number }> = {
  Miraflores: { lat: -12.1211, lng: -77.0297 },
  Barranco: { lat: -12.149, lng: -77.0216 },
};

export default function AddPlace() {
  const { addPlace } = useStore();
  const [name, setName] = useState('');
  const [district, setDistrict] = useState<District>('Barranco');
  const [category, setCategory] = useState<Category>('cafe');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const place = await addPlace({ name: name.trim(), district, category, ...CENTRE[district], isNew: true });
      router.replace(`/rank/${place.id}`);
    } catch {
      setError('No pudimos agregar el lugar. Revisa tu conexión.');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <TextInput
        style={styles.input}
        placeholder="Nombre del lugar"
        placeholderTextColor={colors.muted}
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <Text style={styles.h2}>Distrito</Text>
      <View style={{ flexDirection: 'row' }}>
        {(['Barranco', 'Miraflores'] as const).map((d) => (
          <Chip key={d} label={d} active={district === d} onPress={() => setDistrict(d)} />
        ))}
      </View>
      <Text style={styles.h2}>Tipo</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 }}>
        {(Object.keys(CATEGORY_SINGULAR) as Category[]).map((c) => (
          <Chip key={c} label={CATEGORY_SINGULAR[c]} active={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>
      {error ? <Text style={styles.muted}>{error}</Text> : null}
      <Button title="Agregar y rankear" onPress={save} disabled={saving || name.trim().length < 2} />
    </ScrollView>
  );
}
