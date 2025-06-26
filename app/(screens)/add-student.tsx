import { useState } from 'react';
import { ScrollView, View } from 'react-native'; // Alert'ı buradan kaldırdık
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  TextInput,
  Button,
  SegmentedButtons,
  // Yeni ekleyeceğimiz bileşenler: Dialog, Portal, Provider
  Dialog,
  Portal,
  Provider, // Provider'ı genellikle App.tsx/_layout.tsx içinde tanımlarız, ama burada sadece bu ekran için de tanımlayabiliriz.
            // Eğer zaten _layout.tsx içinde tanımlıysa, buradan Provider'ı kaldırırsınız.
} from 'react-native-paper';

import MyDateTimePicker from '../../components/MyDateTimePicker';

import type { Student, StudentType, Weekday } from '../../types/student';
import { calculateRemainingClasses } from '@/utils/student-utils';

const STORAGE_KEY = 'students-data';

const turkishDays: Weekday[] = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar',
];

export default function AddStudentScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState<StudentType>('bireysel');
  const [day, setDay] = useState<Weekday>('Pazartesi');
  const [lastPaidDate, setLastPaidDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dialog (Uyarı Mesajı) için yeni state'ler
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogMessage, setDialogMessage] = useState('');

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogVisible(true);
  };

  const hideDialog = () => {
    setDialogVisible(false);
  };

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

  const handleSubmit = async () => {
    if (!name.trim()) {
      // Alert.alert yerine showDialog kullanıyoruz
      showDialog('Eksik Bilgi', 'Lütfen öğrencinin adını girin.');
      return;
    }

    if (!day || !type) {
      showDialog('Eksik Bilgi', 'Lütfen tip ve gün alanlarını seçin.');
      return;
    }

    const selectedDay = getWeekdayFromDate(lastPaidDate);
    if (selectedDay !== day) {
      showDialog(
        'Geçersiz Tarih',
        `Seçtiğiniz tarih ${selectedDay}, ama ders günü ${day}. Lütfen uygun bir tarih seçin.`
      );
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      StudentName: name,
      Type: type,
      Day: day,
      LastPaidDate: lastPaidDate.toISOString(),
      UpdatedPaymentDate: lastPaidDate.toISOString(),
      FreeAbsanceUsed: false,
      TeacherCanceledClassNum: 0,
      ExtraClassNum: 0,
      RemainingClassCount: Infinity,
    };

    const remaining = calculateRemainingClasses(newStudent);
    newStudent.RemainingClassCount = remaining;

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const current: Student[] = stored ? JSON.parse(stored) : [];
      const updated = [...current, newStudent];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      router.back();
    } catch (error) {
      console.error("Öğrenci kaydederken hata oluştu:", error);
      showDialog('Hata', 'Öğrenci kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setLastPaidDate(selectedDate);
    }
  };

  return (
    // Provider, Dialog'un doğru şekilde render edilmesi için gereklidir.
    // Genellikle uygulamanızın en üst seviyesinde (App.tsx veya _layout.tsx) tanımlanır.
    // Eğer orada zaten tanımlıysa, bu Provider'ı kaldırabilirsiniz.
    <Provider>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="headlineSmall" style={{ marginBottom: 12 }}>Yeni Öğrenci Ekle</Text>

        <TextInput
          label="Öğrenci Adı"
          value={name}
          onChangeText={setName}
          style={{ marginBottom: 12 }}
        />

        <SegmentedButtons
          value={type}
          onValueChange={(val) => setType(val as StudentType)}
          buttons={[
            { value: 'bireysel', label: 'Bireysel' },
            { value: 'grup', label: 'Grup' },
          ]}
          style={{ marginBottom: 12 }}
        />

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {turkishDays.map((d) => (
            <Button
              key={d}
              mode={day === d ? 'contained' : 'outlined'}
              onPress={() => setDay(d)}
              style={{ margin: 4 }}
            >
              {d}
            </Button>
          ))}
        </View>

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={{ marginBottom: 12 }}
        >
          Son Ödeme Tarihi: {lastPaidDate.toLocaleDateString()}
        </Button>

        {showDatePicker && (
          <MyDateTimePicker
            value={lastPaidDate}
            mode="date"
            onChange={onDateChange}
          />
        )}

        <Button mode="contained" onPress={handleSubmit}>
          Öğrenciyi Ekle
        </Button>
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