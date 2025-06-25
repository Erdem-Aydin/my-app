import { Student } from '../types/student';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PRICE_KEY } from '@/constants/storage';

export async function getLessonPrices(): Promise<{ bireysel: number; grup: number }> {
  const stored = await AsyncStorage.getItem(PRICE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return { bireysel: 1000, grup: 600 }; // fallback değerler
}

export function calculateRemainingClasses(student: Student): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const paidDate = new Date(student.LastPaidDate);
  paidDate.setHours(0, 0, 0, 0);

  // Son ödeme + 28 gün = ödeme kapsama süresi
  const endDate = new Date(paidDate);
  endDate.setDate(endDate.getDate() + 28);

  // Kaç hafta geçmiş?
  const diffTime = Math.max(0, now.getTime() - paidDate.getTime());
  const weeksPassed = Math.floor(diffTime / (7 * 24 * 60 * 60 * 1000));

  let remaining = 4 - weeksPassed;

  // Eklemeleri çıkarımları uygula
  remaining += student.TeacherCanceledClassNum;
  remaining -= student.ExtraClassNum;
  if (student.FreeAbsanceUsed) remaining += 1;

  return remaining;
}

export function getDayIndex(day: string): number {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  return days.indexOf(day);
}
