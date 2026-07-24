export const INDIAN_CROPS = [
  { id: 'rice', name: 'Rice (चावल / ચોખા)', category: 'Cereals' },
  { id: 'wheat', name: 'Wheat (गेहूं / ઘઉં)', category: 'Cereals' },
  { id: 'tomato', name: 'Tomato (टमाटर / ટામેટા)', category: 'Vegetables' },
  { id: 'cotton', name: 'Cotton (कपास / કપાસ)', category: 'Cash Crops' },
  { id: 'potato', name: 'Potato (आलू / બટાકા)', category: 'Vegetables' },
  { id: 'maize', name: 'Maize (मक्का / મકાઈ)', category: 'Cereals' },
  { id: 'soybean', name: 'Soybean (सोयाबीन / સોયાબીન)', category: 'Oilseeds' },
  { id: 'sugarcane', name: 'Sugarcane (गन्ना / શેરડી)', category: 'Cash Crops' },
  { id: 'onion', name: 'Onion (प्याज / ડુંગળી)', category: 'Vegetables' },
  { id: 'chilli', name: 'Chilli (मिर्च / મરચું)', category: 'Spices' },
  { id: 'groundnut', name: 'Groundnut (मूंगफली / મગફળી)', category: 'Oilseeds' },
] as const;

export function getCropDisplayName(cropIdOrName: string): string {
  const match = INDIAN_CROPS.find(
    (c) =>
      c.id.toLowerCase() === cropIdOrName.toLowerCase() ||
      c.name.toLowerCase().includes(cropIdOrName.toLowerCase())
  );
  return match ? match.name.split(' (')[0] : cropIdOrName;
}
