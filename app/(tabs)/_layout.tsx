// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // Ionicons'u import ediyoruz

export default function TabsLayout() {
  return (
    <PaperProvider>
      <Tabs>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Öğrenciler',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              // account-multiple yerine people-outline veya people kullanabiliriz
              <Ionicons name="people-outline" size={size} color={color} /> 
            ),
          }}
        />
        <Tabs.Screen
          name="completed-students"
          options={{
            title: 'Tamamlananlar',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              // check-circle-outline yerine checkmark-done-circle-outline veya checkmark-circle-outline kullanabiliriz
              <Ionicons name="checkmark-circle-outline" size={size} color={color} /> 
            ),
          }}
        />
      </Tabs>
    </PaperProvider>
  );
}