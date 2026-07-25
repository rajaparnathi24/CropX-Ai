export interface DiseaseItem {
  id: string;
  raw: string;
  name: string;
  crop: string;
  severity: 'low' | 'medium' | 'critical';
  symptoms: string[];
  recommendations: string[];
  preventiveMeasures: string[];
}

export interface CropItem {
  id: string;
  name: string;
  category: string;
  diseaseCount: number;
  hindiName: string;
  gujaratiName: string;
}

import rawDiseases from './diseasesData.json';

export const DISEASES_LIST: DiseaseItem[] = (rawDiseases as any[]).map((d, index) => ({
  id: `disease-${index}`,
  raw: d.raw,
  name: d.name,
  crop: d.crop,
  severity: d.severity as 'low' | 'medium' | 'critical',
  symptoms: d.details.symptoms || [],
  recommendations: d.details.recommendations || [],
  preventiveMeasures: d.details.preventiveMeasures || [],
}));

export const CROP_DETAILS: Record<string, { hindi: string; gujarati: string; category: string }> = {
  Cotton: { hindi: 'कपास', gujarati: 'કપાસ', category: 'Cash Crop' },
  Groundnut: { hindi: 'मूंगफली', gujarati: 'મગફળી', category: 'Oilseed' },
  Maize: { hindi: 'मक्का', gujarati: 'મકાઈ', category: 'Cereals' },
  Onion: { hindi: 'प्याज', gujarati: 'ડુંગળી', category: 'Vegetable' },
  Potato: { hindi: 'आलू', gujarati: 'બટાકા', category: 'Vegetable' },
  Tomato: { hindi: 'टमाटर', gujarati: 'ટામેટા', category: 'Vegetable' },
  Wheat: { hindi: 'गेहूं', gujarati: 'ઘઉં', category: 'Cereals' },
};

const uniqueCrops = Array.from(new Set(DISEASES_LIST.map((d) => d.crop)));

export const CROPS_SEARCH_LIST: CropItem[] = uniqueCrops.map((cropName) => {
  const details = CROP_DETAILS[cropName] || { hindi: cropName, gujarati: cropName, category: 'Crop' };
  const count = DISEASES_LIST.filter((d) => d.crop === cropName).length;
  return {
    id: cropName.toLowerCase(),
    name: cropName,
    category: details.category,
    diseaseCount: count,
    hindiName: details.hindi,
    gujaratiName: details.gujarati,
  };
});
