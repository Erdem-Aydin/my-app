import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, TextInput, Button, Appbar } from 'react-native-paper';

const LESSON_PRICE_KEY = 'lessonPrices';

export default function SettingsScreen() {
  const [bireysel, setBireysel] = useState('');
  const [grup, setGrup] = useState('');

  useEffect(() => {
    const loadPrices = async () => {
      const stored = await AsyncStorage.getItem(LESSON_PRICE_KEY);
      if (stored) {
        const prices = JSON.parse(stored);
        setBireysel(prices.bireysel.toString());
        setGrup(prices.grup.toString());
      }
    };
    loadPrices();
  }, []);

  const savePrices = async () => {
    const parsed = {
      bireysel: parseInt(bireysel),
      grup: parseInt(grup),
    };
    await AsyncStorage.setItem(LESSON_PRICE_KEY, JSON.stringify(parsed));
    alert('Ücretler kaydedildi.');
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Ücret Ayarları" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text variant="titleMedium">Bireysel Ders Ücreti (TL)</Text>
        <TextInput
          mode="outlined"
          keyboardType="numeric"
          value={bireysel}
          onChangeText={setBireysel}
          style={{ marginBottom: 16 }}
        />

        <Text variant="titleMedium">Grup Dersi Ücreti (TL)</Text>
        <TextInput
          mode="outlined"
          keyboardType="numeric"
          value={grup}
          onChangeText={setGrup}
          style={{ marginBottom: 16 }}
        />

        <Button mode="contained" onPress={savePrices}>Kaydet</Button>
      </ScrollView>
    </View>
  );
}

// Bu sayfayı router'da "settings" gibi bir route'a eklemeyi unutma.
