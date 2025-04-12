// Mock map markers data for the interactive map

export interface MapMarker {
  id: string;
  name: string;
  description?: string;
  type: 'marker' | 'polygon' | 'rectangle';
  coordinates: [number, number] | [number, number][] | [number, number][][];
  markerType: 'home' | 'resource' | 'danger' | 'ally' | 'cache' | 'other';
  icon?: string;
  createdAt: string;
}

// Center coordinates: USF Tampa campus (28.0587, -82.4139)
const mockMapMarkers: MapMarker[] = [
  {
    id: '1',
    name: 'Home Base',
    description: 'Our main shelter and operations center',
    type: 'marker',
    coordinates: [28.0587, -82.4139],
    markerType: 'home',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Fresh Water Source',
    description: 'Clean water spring, safe for drinking after boiling',
    type: 'marker',
    coordinates: [28.0627, -82.4179],
    markerType: 'resource',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Abandoned Pharmacy',
    description: 'Partially looted, but might still have supplies',
    type: 'marker',
    coordinates: [28.0547, -82.4099],
    markerType: 'resource',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Hostile Group Territory',
    description: 'Dangerous area controlled by hostile survivors',
    type: 'polygon',
    coordinates: [
      [28.0637, -82.4239],
      [28.0657, -82.4189],
      [28.0617, -82.4159],
      [28.0597, -82.4209]
    ],
    markerType: 'danger',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Supply Cache',
    description: 'Hidden emergency supplies',
    type: 'marker',
    coordinates: [28.0527, -82.4119],
    markerType: 'cache',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Ally Settlement',
    description: 'Friendly group of survivors willing to trade',
    type: 'marker',
    coordinates: [28.0647, -82.4079],
    markerType: 'ally',
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Hunting Grounds',
    description: 'Good area for hunting small game',
    type: 'rectangle',
    coordinates: [
      [28.0507, -82.4219],
      [28.0557, -82.4219],
      [28.0557, -82.4169],
      [28.0507, -82.4169]
    ],
    markerType: 'resource',
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Radiation Zone',
    description: 'Dangerous levels of radiation, avoid at all costs',
    type: 'polygon',
    coordinates: [
      [28.0687, -82.4139],
      [28.0707, -82.4089],
      [28.0667, -82.4059],
      [28.0647, -82.4109]
    ],
    markerType: 'danger',
    createdAt: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Old Gas Station',
    description: 'Might have fuel or other supplies',
    type: 'marker',
    coordinates: [28.0517, -82.4189],
    markerType: 'resource',
    createdAt: new Date().toISOString()
  },
  {
    id: '10',
    name: 'Observation Point',
    description: 'Good vantage point to survey the area',
    type: 'marker',
    coordinates: [28.0607, -82.4069],
    markerType: 'other',
    createdAt: new Date().toISOString()
  }
];

export default mockMapMarkers;