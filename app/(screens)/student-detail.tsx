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
  // Dialog, Portal, Provider eklendi
  Dialog,
  Portal,
  Provider,
} from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY } from '../../constants/storage';
import { Student, Weekday } from '../../types/student'; // Weekday de import edildi
// DateTimePicker kaldırıldı
// import DateTimePicker from '@react-native-community/datetimepicker';
import MyDateTimePicker from '../../components/MyDateTimePicker'; // Kendi özel DateTimePicker'ımız

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

  // Dialog (Uyarı Mesajı) için yeni state'ler
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  // Dialog'u göstermek için yardımcı fonksiyon
  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  // Dialog'u gizlemek için yardımcı fonksiyon
  const hideDialog = () => {
    setDialogVisible(false);
  };

  // Tarihten haftanın gününü almak için yardımcı fonksiyon
  const getWeekdayFromDate = (date: Date): Weekday => {
    const jsDay = date.getDay(); // 0 (Pazar) to 6 (Cumartesi)
    const dayMap: Weekday[] = [
      'Pazar',
      'Pazartesi',
      'Salı',
      'Çarşamba',
      'Perşembe',
      'Cuma',
      'Cumartesi',
    ];
    return dayMap[jsDay];
  };

  // Öğrenci verisini çekme
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        const students: Student[] = json ? JSON.parse(json) : [];
        const found = students.find((s) => s.id.toString() === id);
        setStudent(found ?? null);
      } catch (err) {
        console.error('Veri alınırken hata:', err);
        showDialog('Hata', 'Öğrenci verileri yüklenirken bir sorun oluştu.');
      }
    };
    fetchStudent();
  }, [id]);

  // Öğrenci alanlarını güncelleme
  const updateField = async (field: keyof Student, value: any) => {
    if (!student) return;

    let updatedValue = value;

    // Eğer güncellenen alan 'LastPaidDate' ise ek kontrol yap
    if (field === 'LastPaidDate') {
      const selectedDate = new Date(value);
      const selectedDay = getWeekdayFromDate(selectedDate);
      // Seçilen tarihin, öğrencinin ders günüyle eşleşip eşleşmediğini kontrol et
      if (selectedDay !== student.Day) {
        showDialog(
          'Geçersiz Tarih',
          `Seçtiğiniz tarih ${selectedDay}, ancak ders günü ${student.Day}.`
        );
        // Hatalı tarih seçimi durumunda güncellemeyi iptal et
        return;
      }
      updatedValue = selectedDate.toISOString(); // Tarihi ISO formatına çevir
    }

    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);
      const students: Student[] = json ? JSON.parse(json) : [];
      const updatedStudents = students.map((s) =>
        s.id === student.id ? { ...s, [field]: updatedValue } : s
      );
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStudents));
      setStudent({ ...student, [field]: updatedValue }); // UI'yi güncelle
    } catch (err) {
      console.error('Alan güncellenirken hata:', err);
      showDialog('Hata', 'Bilgiler güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  // Öğrenci bulunamazsa gösterilecek ekran
  if (!student) {
    return (
      <View style={{ padding: 16 }}>
        <Text>Öğrenci bulunamadı.</Text>
      </View>
    );
  }

  return (
    // Eğer app/_layout.tsx içinde PaperProvider varsa bu Provider'ı kaldırın
    <Provider>
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
            {/* İsim Alanı */}
            <Text variant="titleMedium">İsim</Text>
            {editMode ? (
              <TextInput
                mode="outlined"
                value={student.StudentName}
                onChangeText={(val) => {
                  if (!val.trim()) { // İsim boş bırakılırsa uyarı ver
                    showDialog('Eksik Bilgi', 'Öğrenci adı boş bırakılamaz.');
                  }
                  updateField('StudentName', val);
                }}
                style={{ marginBottom: 8 }}
              />
            ) : (
              <Text style={{ marginBottom: 8 }}>{student.StudentName}</Text>
            )}
            <Divider style={{ marginVertical: 8 }} />

            {/* Tip Alanı */}
            <Text variant="titleMedium">Tip</Text>
            {editMode ? (
              <SegmentedButtons
                value={student.Type}
                onValueChange={(val) => updateField('Type', val)}
                buttons={[
                  { label: 'Bireysel', value: 'bireysel' },
                  { label: 'Grup', value: 'grup' },
                ]}
                style={{ marginBottom: 8 }}
              />
            ) : (
              <Text style={{ marginBottom: 8 }}>{student.Type}</Text>
            )}
            <Divider style={{ marginVertical: 8 }} />

            {/* Ders Günü Alanı */}
            <Text variant="titleMedium">Ders Günü</Text>
            {editMode ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <SegmentedButtons
                  value={student.Day}
                  onValueChange={(val) => updateField('Day', val as Weekday)}
                  buttons={[
                    'Pazartesi',
                    'Salı',
                    'Çarşamba',
                    'Perşembe',
                    'Cuma',
                    'Cumartesi',
                    'Pazar',
                  ].map((d) => ({ label: d, value: d }))}
                  style={{ minWidth: 700, marginBottom: 8 }}
                />
              </ScrollView>
            ) : (
              <Text style={{ marginBottom: 8 }}>{student.Day}</Text>
            )}
            <Divider style={{ marginVertical: 8 }} />

            {/* Son Ödeme Tarihi Alanı */}
            <Text variant="titleMedium">Son Ödeme Tarihi</Text>
            {editMode ? (
              <View style={{ marginBottom: 8 }}>
                <Button onPress={() => setShowDatePicker(true)} mode="outlined">
                  {new Date(student.LastPaidDate).toLocaleDateString()}
                </Button>
                {showDatePicker && (
                  <MyDateTimePicker
                    value={new Date(student.LastPaidDate)}
                    mode="date"
                    onChange={(event, date) => {
                      setShowDatePicker(false);
                      if (date) {
                        // Tarih seçildiğinde updateField fonksiyonunu çağırıyoruz
                        updateField('LastPaidDate', date.toISOString());
                      }
                    }}
                  />
                )}
              </View>
            ) : (
              <Text style={{ marginBottom: 8 }}>{new Date(student.LastPaidDate).toLocaleDateString()}</Text>
            )}
            <Divider style={{ marginVertical: 8 }} />

            {/* Kalan Ders Sayısı */}
            <Text variant="titleMedium">Kalan Ders Sayısı</Text>
            <Text style={{ marginBottom: 8 }}>{calculateRemainingClasses(student)}</Text>
            <Divider style={{ marginVertical: 8 }} />

            {/* Ücretsiz Devamsızlık */}
            <Text variant="titleMedium">Ücretsiz Devamsızlık</Text>
            <Switch
              value={student.FreeAbsanceUsed}
              onValueChange={(val) => updateField('FreeAbsanceUsed', val)}
              style={{ marginBottom: 8 }}
            />
            <Divider style={{ marginVertical: 8 }} />

            {/* Öğretmen İptali */}
            <Text variant="titleMedium">Öğretmen İptali</Text>
            <SegmentedButtons
              value={student.TeacherCanceledClassNum.toString()}
              onValueChange={(val) =>
                updateField('TeacherCanceledClassNum', parseInt(val))
              }
              buttons={['0', '1', '2', '3'].map((v) => ({ label: v, value: v }))}
              style={{ marginBottom: 8 }}
            />
            <Divider style={{ marginVertical: 8 }} />

            {/* Ekstra Ders */}
            <Text variant="titleMedium">Ekstra Ders</Text>
            <SegmentedButtons
              value={student.ExtraClassNum.toString()}
              onValueChange={(val) =>
                updateField('ExtraClassNum', parseInt(val))
              }
              buttons={['0', '1', '2', '3'].map((v) => ({ label: v, value: v }))}
              style={{ marginBottom: 8 }}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Dialog Bileşeni */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={hideDialog}>
          <Dialog.Title>{dialogTitle}</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">{dialogMessage}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDialog}>Tamam</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Provider>
  );
}