// app/(tabs)/completed-students.tsx
import { useEffect, useState } from 'react';
import { View, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Card, Checkbox, Text, Button, IconButton } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import { STORAGE_KEY } from '@/constants/storage';
import { calculateRemainingClasses, getDayIndex } from '@/utils/student-utils';
import { Student } from '@/types/student';
import { getLessonPrices } from '@/utils/student-utils';
import { Surface } from 'react-native-paper';

export default function CompletedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prices, setPrices] = useState({ bireysel: 1000, grup: 600 });
  const router = useRouter();

  const loadStudents = async () => {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: Student[] = json ? JSON.parse(json) : [];
    setStudents(parsed);
  };

  const loadPrices = async () => {
    const stored = await getLessonPrices();
    setPrices(stored);
  };

  useFocusEffect(() => {
    loadStudents();
    loadPrices();
  });

  const completedStudents = students.filter(s => calculateRemainingClasses(s) <= 0);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handlePayment = async () => {
    const updated = students.map(s => {
      if (!selectedIds.includes(s.id)) return s;

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const lessonDayIndex = getDayIndex(s.Day);
      const remaining = calculateRemainingClasses(s);

      let newPaidDate = new Date(now);
      let count = Math.abs(remaining);

      if (now.getDay() === lessonDayIndex) {
        count--;
      }

      while (count >= 0) {
        newPaidDate.setDate(newPaidDate.getDate() - 1);
        if (newPaidDate.getDay() === lessonDayIndex) {
          count--;
        }
      }

      return {
        ...s,
        LastPaidDate: newPaidDate.toISOString(),
        FreeAbsanceUsed: false,
        TeacherCanceledClassNum: 0,
        ExtraClassNum: 0,
      };
    });

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSelectedIds([]);
    loadStudents();
  };

  const getFee = (student: Student) =>
    prices[student.Type as 'bireysel' | 'grup'] || 0;

  const totalFeeAll = completedStudents.reduce((sum, s) => sum + getFee(s), 0);
  const totalFeeSelected = completedStudents
    .filter(s => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + getFee(s), 0);

  const allSelected = selectedIds.length === completedStudents.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(completedStudents.map(s => s.id));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Tamamlanan Dersler" />
        <Appbar.Action
          icon="cog"
          onPress={() => router.push('/setting-prices')}
        />
      </Appbar.Header>

      <View style={{ padding: 16 }}>
        <Surface style={{ margin: 16, padding: 16, borderRadius: 8, elevation: 2 }}>
          <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
            Toplam alınacak ücret: {totalFeeAll} TL
          </Text>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 4 }}>
            Toplam öğrenci sayısı: {completedStudents.length}
          </Text>
          <Text variant="titleMedium" style={{ fontWeight: 'bold', marginTop: 4 }}>
            Seçili öğrencilerden alınacak: {totalFeeSelected} TL
          </Text>
        </Surface>

        <Button
          onPress={toggleSelectAll}
          style={{ marginTop: 10 }}
          mode="outlined"
        >
          {allSelected ? 'Tüm Seçimleri Kaldır' : 'Tümünü Seç'}
        </Button>
      </View>

      <FlatList
        data={completedStudents.sort((a, b) =>
          a.StudentName.localeCompare(b.StudentName)
        )}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Card style={{ margin: 10 }}>
            <Card.Title
              title={item.StudentName}
              subtitle={`Tip: ${item.Type} • Gün: ${item.Day}`}
              right={() => (
                <Checkbox
                  status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'}
                  onPress={() => toggleSelect(item.id)}
                />
              )}
            />
          </Card>
        )}
      />

      <Button
        mode="contained"
        onPress={handlePayment}
        disabled={selectedIds.length === 0}
        style={{ margin: 16 }}
      >
        Ödeme Alındı
      </Button>
    </View>
  );
}
