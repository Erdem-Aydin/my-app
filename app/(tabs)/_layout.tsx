// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // MaterialCommunityIcons'u import ediyoruz

export default function TabsLayout() {
  return (
    // PaperProvider zaten RootLayout'ta sarmalandığı için burada tekrar olmasına gerek yok,
    // ancak sorun çıkarmıyorsa tutabilirsiniz. Eğer hata verirse kaldırın.
    <PaperProvider>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Öğrenciler',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="account-multiple" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="completed-students"
          options={{
            title: 'Tamamlananlar',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="check-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}