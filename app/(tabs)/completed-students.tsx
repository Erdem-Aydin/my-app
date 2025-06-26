// app/(tabs)/completed-students.tsx
import { useEffect, useState, useCallback } from 'react'; // useCallback eklendi
import { View, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appbar, Card, Checkbox, Text, Button, Surface } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router'; // useFocusEffect eklendi
import { STORAGE_KEY } from '@/constants/storage';
import { calculateRemainingClasses, getDayIndex, getLessonPrices } from '@/utils/student-utils';
import { Student } from '@/types/student';

export default function CompletedStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [prices, setPrices] = useState({ bireysel: 1000, grup: 600 });
  const [isReady, setIsReady] = useState(false);
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

  // Sadece bu kısmı değiştiriyoruz: useEffect yerine useFocusEffect kullanılıyor
  useFocusEffect(
    // useCallback kullanarak, bu fonksiyonun sadece bağımlılıkları değiştiğinde yeniden oluşturulmasını sağlıyoruz.
    // Bağımlılık dizisi boş olduğu için, sayfa her odaklandığında çalışacak.
    useCallback(() => {
      console.log('CompletedStudentsPage odaklandı, veriler yenileniyor...'); // Konsola bilgi ekleyelim
      loadStudents(); // Öğrencileri yeniden yükle
      loadPrices();   // Fiyatları yeniden yükle
      setSelectedIds([]); // Sayfa her odaklandığında seçili öğrencileri temizle
      setIsReady(true); // Verilerin yüklendiğini işaretle
      
      // Temizleme fonksiyonu: Sayfa odak dışına çıktığında yapılacaklar
      return () => {
        console.log('CompletedStudentsPage odak dışına çıktı.');
        // Örneğin, eğer bu sayfada özel abonelikler veya zamanlayıcılar olsaydı,
        // onları burada temizlerdik. Bu durumda sadece selectedIds'ı temizliyoruz.
      };
    }, []) // Boş bağımlılık dizisi sayesinde, sayfa her odaklandığında bu efekt çalışır.
  );

  const completedStudents = students.filter(s => calculateRemainingClasses(s) <= 0);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Bu fonksiyonun içeriğine DOKUNMUYORUZ.
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
    // handlePayment bittikten sonra veriyi manuel olarak tekrar yüklemiyoruz,
    // çünkü sayfa yeniden odaklandığında (örneğin pop-up kapandığında veya tab değiştiğinde)
    // useFocusEffect zaten otomatik olarak loadStudents'ı çağıracak.
    // Ancak, işlemin hemen ardından UI'nin güncellenmesi için burada bir çağrıya ihtiyacımız var.
    // Bu yüzden bu satırı geri getiriyorum ki ödeme alınca liste anında güncellensin.
    await loadStudents();
  };

  const getFee = (student: Student) =>
    prices[student.Type as 'bireysel' | 'grup'] || 0;

  const totalFeeAll = completedStudents.reduce((sum, s) => sum + getFee(s), 0);
  const totalFeeSelected = completedStudents
    .filter(s => selectedIds.includes(s.id))
    .reduce((sum, s) => sum + getFee(s), 0);

  // Bu satırı önceki çalışan haline getiriyorum.
  const allSelected = selectedIds.length === completedStudents.length && completedStudents.length > 0;


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

      {isReady && (
        <>
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
                  subtitle={`Tip: ${item.Type} • Gün: ${item.Day} • Kalan: ${calculateRemainingClasses(item)}`}
                  right={() => (
                    <Checkbox
                      status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'}
                      onPress={() => toggleSelect(item.id)}
                    />
                  )}
                />
              </Card>
            )}
            ListEmptyComponent={() => (
              <View style={{ 
                flex: 1, 
                justifyContent: 'center', // Dikeyde ortala
                alignItems: 'center',   // Yatayda ortala
                marginTop: 50,          // Yukarıdan biraz boşluk bırak
                paddingHorizontal: 20,  // Yatayda içeriğe boşluk ekle
              }}>
                <Text variant="titleMedium" style={{ 
                    textAlign: 'center', // Yazıyı ortala
                    color: '#6c757d'     // Hafif gri renk, daha yumuşak bir görünüm için
                }}>
                  Şu an için tamamlanmış dersi olan öğrenci bulunmamaktadır. 🎉
                </Text>
                <Text variant="bodyMedium" style={{ 
                    textAlign: 'center', 
                    color: '#8d9297', 
                    marginTop: 10 
                }}>
                  Yeni ödemeler yapıldığında burada görünecekler.
                </Text>
              </View>
            )}
          />


          <Button
            mode="contained"
            onPress={handlePayment}
            disabled={selectedIds.length === 0}
            style={{ margin: 16 }}
          >
            Ödeme Alındı ({selectedIds.length})
          </Button>
        </>
      )}
    </View>
  );
}