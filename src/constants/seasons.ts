import { IndianSeason } from '@/types';

export const SEASONS_INFO: Record<
  IndianSeason,
  { name: string; localName: string; months: string; description: string }
> = {
  Kharif: {
    name: 'Kharif',
    localName: 'खरीफ / ચોમાસું',
    months: 'June – October',
    description: 'Monsoon crops sown at the beginning of the rainy season.',
  },
  Rabi: {
    name: 'Rabi',
    localName: 'रबी / શિયાળુ',
    months: 'November – February',
    description: 'Winter crops sown after the monsoon rains.',
  },
  Zaid: {
    name: 'Zaid',
    localName: 'जायद / ઉનાળુ',
    months: 'March – May',
    description: 'Summer crops grown between Rabi and Kharif seasons.',
  },
};

export function getIndianSeason(date: Date = new Date()): IndianSeason {
  const month = date.getMonth(); // 0 = Jan, 11 = Dec

  // June (5) to Oct (9) -> Kharif
  if (month >= 5 && month <= 9) {
    return 'Kharif';
  }
  // Nov (10) to Feb (1) -> Rabi
  if (month >= 10 || month <= 1) {
    return 'Rabi';
  }
  // Mar (2) to May (4) -> Zaid
  return 'Zaid';
}
