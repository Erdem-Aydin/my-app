import { Tabs } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <PaperProvider>
      <Tabs>
        <Tabs.Screen
          name="students"
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
