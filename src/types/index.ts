export type IndianSeason = 'Kharif' | 'Rabi' | 'Zaid';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  state: string;
  district: string;
  primaryCrop?: string;
  createdAt: string;
}

export interface ScanRecord {
  id: string;
  userId: string;
  imageUrl: string;
  crop: string;
  disease: string;
  confidence: number; // 0 to 100
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  date: string; // ISO string
  season: IndianSeason;
  state: string;
  district: string;
  fieldNote?: string;
}

export interface DiseaseReport {
  id: string;
  title: string;
  crop: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedCount: number;
  lastDetected: string;
  recommendedTreatment: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  condition: string;
  icon: string;
  rainfall: number;
  windSpeed: number;
  district: string;
  state: string;
  updatedAt: string;
  forecast: Array<{
    day: string;
    tempHigh: number;
    tempLow: number;
    condition: string;
  }>;
}

export interface PredictResponse {
  crop: string;
  disease: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  symptoms: string[];
  recommendations: string[];
  preventiveMeasures: string[];
  season: IndianSeason;
}

export interface PostComment {
  id: string;
  postId: string;
  authorName: string;
  authorLocation: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorLocation: string;
  cropCategory: string;
  title: string;
  content: string;
  imageUrl?: string;
  likes: number;
  commentsCount: number;
  comments?: PostComment[];
  createdAt: string;
}
