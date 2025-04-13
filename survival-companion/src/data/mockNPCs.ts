// Mock NPC data for the bartering system

import { InventoryItem } from "./mockInventory";

export interface NPC {
  id: string;
  name: string;
  description: string;
  specialty:
    | "Food"
    | "Water"
    | "Medicine"
    | "Weapons"
    | "Ammo"
    | "Tools"
    | "Clothing"
    | "Miscellaneous";
  inventory: InventoryItem[];
  relationshipLevel: number;
  avatar?: string;
}

const mockNPCs: NPC[] = [
  {
    id: "1",
    name: "Doc Wilson",
    description: "Former surgeon who now trades medical supplies",
    specialty: "Medicine",
    relationshipLevel: 50,
    avatar: "assets/images/Doctor_Wilson.png",
    inventory: [
      {
        id: "npc1-1",
        name: "Antibiotics",
        category: "Medicine",
        quantity: 5,
        description: "Broad-spectrum antibiotics for infections",
        icon: "Medicine.png",
      },
      {
        id: "npc1-2",
        name: "Painkillers",
        category: "Medicine",
        quantity: 10,
        description: "Strong painkillers for serious injuries",
        icon: "Medicine.png",
      },
      {
        id: "npc1-3",
        name: "First Aid Kit",
        category: "Medicine",
        quantity: 2,
        description: "Complete kit with bandages, antiseptics, and more",
        icon: "Medicine.png",
      },
    ],
  },
  {
    id: "2",
    name: "Hunter Mike",
    description: "Experienced hunter who trades weapons and ammo",
    specialty: "Weapons",
    relationshipLevel: 30,
    avatar: "assets/images/Hunter_Mike.png",
    inventory: [
      {
        id: "npc2-1",
        name: "Hunting Rifle",
        category: "Weapons",
        quantity: 1,
        description: "Accurate long-range rifle",
        icon: "Weapons.png",
      },
      {
        id: "npc2-2",
        name: "Rifle Ammo",
        category: "Ammo",
        quantity: 20,
        description: "Standard rifle ammunition",
        icon: "Ammo.png",
      },
      {
        id: "npc2-3",
        name: "Hunting Trap",
        category: "Tools",
        quantity: 3,
        description: "Traps for catching small game",
        icon: "Tools.png",
      },
    ],
  },
  {
    id: "3",
    name: "Farmer Sarah",
    description: "Runs a small farm and trades food supplies",
    specialty: "Food",
    relationshipLevel: 70,
    avatar: "assets/images/Farmer_Sarah.png",
    inventory: [
      {
        id: "npc3-1",
        name: "Fresh Vegetables",
        category: "Food",
        quantity: 15,
        description: "Assorted fresh vegetables",
        icon: "Food.png",
      },
      {
        id: "npc3-2",
        name: "Dried Meat",
        category: "Food",
        quantity: 8,
        description: "Preserved meat that lasts for months",
        icon: "Food.png",
      },
      {
        id: "npc3-3",
        name: "Seeds",
        category: "Miscellaneous",
        quantity: 20,
        description: "Various vegetable seeds for planting",
        icon: "Misc.png",
      },
    ],
  },
];

export default mockNPCs;
