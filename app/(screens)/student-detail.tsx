import { View, ScrollView } from 'react-native';
import {
  Text,
  Card,
  Divider,
  Switch,
  SegmentedButtons,
  TextInput,
  IconButton,
  Button,
} from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '../../constants/storage';
import { Student } from '../../types/student';
import DateTimePicker from '@react-native-community/datetimepicker';
import { calculateRemainingClasses } from '../../utils/student-utils';

import type { ScreenProps } from 'expo-router';

export const options: ScreenProps<any>['options'] = {
  title: 'Öğrenci Detayı',
};
export default function StudentDetailPage() {

  const { id } = useLocalSearchParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        const students: Student[] = json ? JSON.parse(json) : [];
        const found = students.find((s) => s.id.toString() === id);
        setStudent(found ?? null);
      } catch (err) {
        console.error('Veri alınırken hata:', err);
      }
    };
    fetchStudent();
  }, [id]);

  const updateField = async (field: keyof Student, value: any) => {
    if (!student) return;
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const students: Student[] = json ? JSON.parse(json) : [];
      const updatedStudents = students.map((s) =>
        s.id === student.id ? { ...s, [field]: value } : s
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStudents));
      setStudent({ ...student, [field]: value });
    } catch (err) {
      console.error('Alan güncellenirken hata:', err);
    }
  };

  if (!student) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Öğrenci bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Card>
        <Card.Title
          title="Öğrenci Detayı"
          right={(props) => (
            <IconButton
              {...props}
              icon={editMode ? 'check' : 'pencil'}
              onPress={() => setEditMode(!editMode)}
            />
          )}
        />
        <Card.Content>
          <Text variant="titleMedium">İsim</Text>
          {editMode ? (
            <TextInput
              mode="outlined"
              value={student.StudentName}
              onChangeText={(val) => updateField('StudentName', val)}
            />
          ) : (
            <Text>{student.StudentName}</Text>
          )}
          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleMedium">Tip</Text>
          {editMode ? (
            <SegmentedButtons
              value={student.Type}
              onValueChange={(val) => updateField('Type', val)}
              buttons={[
                { label: 'Bireysel', value: 'bireysel' },
                { label: 'Grup', value: 'grup' },
              ]}
            />
          ) : (
            <Text>{student.Type}</Text>
          )}
          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleMedium">Ders Günü</Text>
          {editMode ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <SegmentedButtons
                value={student.Day}
                onValueChange={(val) => updateField('Day', val)}
                buttons={[
                  'Pazartesi',
                  'Salı',
                  'Çarşamba',
                  'Perşembe',
                  'Cuma',
                  'Cumartesi',
                  'Pazar',
                ].map((d) => ({ label: d, value: d }))}
                style={{ minWidth: 700 }} // bu satır kaydırma için önemli
              />
            </ScrollView>
          ) : (
            <Text>{student.Day}</Text>
          )}
          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleMedium">Son Ödeme Tarihi</Text>
          {editMode ? (
            <View>
              <Button onPress={() => setShowDatePicker(true)}>
                {new Date(student.LastPaidDate).toLocaleDateString()}
              </Button>
              {showDatePicker && (
                <DateTimePicker
                  value={new Date(student.LastPaidDate)}
                  mode="date"
                  display="default"
                  onChange={(event, date) => {
                    setShowDatePicker(false);
                    if (!date) return;

                    const jsDay = date.getDay();
                    const weekdayMap = [
                      'Pazar',
                      'Pazartesi',
                      'Salı',
                      'Çarşamba',
                      'Perşembe',
                      'Cuma',
                      'Cumartesi',
                    ];

                    const selectedDay = weekdayMap[jsDay];
                    if (selectedDay !== student.Day) {
                      alert(`Seçtiğiniz tarih ${selectedDay}, ancak ders günü ${student.Day}.`);
                      return;
                    }

                    updateField('LastPaidDate', date.toISOString());
                  }}

                />
              )}
            </View>
          ) : (
            <Text>{new Date(student.LastPaidDate).toLocaleDateString()}</Text>
          )}
          <Divider style={{ marginVertical: 8 }} />

            <Text variant="titleMedium">Kalan Ders Sayısı</Text>
            <Text>{calculateRemainingClasses(student)}</Text>
          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleMedium">Ücretsiz Devamsızlık</Text>
          <Switch
            value={student.FreeAbsanceUsed}
            onValueChange={(val) => updateField('FreeAbsanceUsed', val)}
          />
          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleMedium">Öğretmen İptali</Text>
          <SegmentedButtons
            value={student.TeacherCanceledClassNum.toString()}
            onValueChange={(val) =>
              updateField('TeacherCanceledClassNum', parseInt(val))
            }
            buttons={['0', '1', '2', '3'].map((v) => ({ label: v, value: v }))}
          />
          <Divider style={{ marginVertical: 8 }} />

          <Text variant="titleMedium">Ekstra Ders</Text>
          <SegmentedButtons
            value={student.ExtraClassNum.toString()}
            onValueChange={(val) =>
              updateField('ExtraClassNum', parseInt(val))
            }
            buttons={['0', '1', '2', '3'].map((v) => ({ label: v, value: v }))}
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}
