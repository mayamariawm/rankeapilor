import type { Place } from './types';

// Starter seed for the pilot. These are well-known Miraflores and Barranco spots,
// but every pin is APPROXIMATE and none has been checked on site (verified: false).
// Before wave 1: confirm each place is open, fix its coordinates from Google Maps,
// mark recent openings with isNew, and grow the list to ~120 (see docs/venues.csv).
export const SEED_PLACES: Place[] = [
  // Barranco
  { id: 'isolina', name: 'Isolina Taberna Peruana', district: 'Barranco', category: 'restaurante', lat: -12.1497, lng: -77.0213, verified: false },
  { id: 'central', name: 'Central', district: 'Barranco', category: 'restaurante', lat: -12.1458, lng: -77.0225, verified: false },
  { id: 'kjolle', name: 'Kjolle', district: 'Barranco', category: 'restaurante', lat: -12.1459, lng: -77.0227, verified: false },
  { id: 'juanito', name: 'Juanito de Barranco', district: 'Barranco', category: 'bar', lat: -12.1492, lng: -77.0219, verified: false },
  { id: 'ayahuasca', name: 'Ayahuasca Restobar', district: 'Barranco', category: 'bar', lat: -12.1479, lng: -77.0213, verified: false },
  { id: 'bisetti', name: 'Tostaduría Bisetti', district: 'Barranco', category: 'cafe', lat: -12.1491, lng: -77.0210, verified: false },
  { id: 'origen', name: 'Origen Tostadores de Café', district: 'Barranco', category: 'cafe', lat: -12.1484, lng: -77.0199, verified: false },
  { id: 'panetteria', name: 'La Panetteria', district: 'Barranco', category: 'panaderia', lat: -12.1442, lng: -77.0204, verified: false },
  { id: 'puku-barranco', name: 'Puku Puku Café', district: 'Barranco', category: 'cafe', lat: -12.1473, lng: -77.0207, verified: false },
  { id: 'cala', name: 'Cala Restaurante', district: 'Barranco', category: 'restaurante', lat: -12.1530, lng: -77.0245, verified: false },

  // Miraflores
  { id: 'maido', name: 'Maido', district: 'Miraflores', category: 'restaurante', lat: -12.1243, lng: -77.0290, verified: false },
  { id: 'la-mar', name: 'La Mar Cebichería', district: 'Miraflores', category: 'restaurante', lat: -12.1079, lng: -77.0366, verified: false },
  { id: 'pan-chola', name: 'El Pan de la Chola', district: 'Miraflores', category: 'panaderia', lat: -12.1137, lng: -77.0398, verified: false },
  { id: 'neira', name: 'Neira Café Lab', district: 'Miraflores', category: 'cafe', lat: -12.1246, lng: -77.0258, verified: false },
  { id: 'arabica', name: 'Arábica Espresso Bar', district: 'Miraflores', category: 'cafe', lat: -12.1197, lng: -77.0360, verified: false },
  { id: 'puku-miraflores', name: 'Puku Puku Café Miraflores', district: 'Miraflores', category: 'cafe', lat: -12.1215, lng: -77.0306, verified: false },
  { id: 'mayta', name: 'Mayta', district: 'Miraflores', category: 'restaurante', lat: -12.1188, lng: -77.0345, verified: false },
  { id: 'rafael', name: 'Rafael', district: 'Miraflores', category: 'restaurante', lat: -12.1131, lng: -77.0397, verified: false },
  { id: 'manolo', name: 'Manolo', district: 'Miraflores', category: 'brunch', lat: -12.1215, lng: -77.0289, verified: false },
  { id: 'bao', name: 'Bao?', district: 'Miraflores', category: 'restaurante', lat: -12.1203, lng: -77.0322, verified: false },
];
