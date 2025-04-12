// Mock inventory data for development

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Food' | 'Water' | 'Medicine' | 'Weapons' | 'Ammo' | 'Tools' | 'Clothing' | 'Miscellaneous';
  quantity: number;
  description?: string;
  icon?: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Canned Beans',
    category: 'Food',
    quantity: 5,
    description: 'High in protein and long shelf life',
    icon: 'Food.png'
  },
  {
    id: '2',
    name: 'Water Bottle',
    category: 'Water',
    quantity: 8,
    description: 'Purified drinking water, 500ml each',
    icon: 'Water.png'
  },
  {
    id: '3',
    name: 'Bandages',
    category: 'Medicine',
    quantity: 12,
    description: 'Sterile bandages for wound treatment',
    icon: 'Medicine.png'
  },
  {
    id: '4',
    name: 'Hunting Knife',
    category: 'Weapons',
    quantity: 1,
    description: 'Sharp and durable survival knife',
    icon: 'Weapons.png'
  },
  {
    id: '5',
    name: 'Shotgun Shells',
    category: 'Ammo',
    quantity: 24,
    description: '12 gauge shotgun ammunition',
    icon: 'Ammo.png'
  },
  {
    id: '6',
    name: 'Multi-tool',
    category: 'Tools',
    quantity: 1,
    description: 'Versatile tool with pliers, knife, screwdrivers',
    icon: 'Tools.png'
  },
  {
    id: '7',
    name: 'Winter Jacket',
    category: 'Clothing',
    quantity: 1,
    description: 'Warm, waterproof jacket for cold weather',
    icon: 'Clothing.png'
  },
  {
    id: '8',
    name: 'Radio',
    category: 'Miscellaneous',
    quantity: 1,
    description: 'Battery-powered emergency radio',
    icon: 'Misc.png'
  }
];

export default mockInventory;