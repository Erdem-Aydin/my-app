import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';

export default function ScreensLayout() {
  return (
    <PaperProvider>
      <Stack
        screenOptions={{
          headerShown: true, // ✅ kendi başlığını göstermek istiyorsun
        }}
      >
        <Stack.Screen
          name="student-detail"
          options={{ title: 'Öğrenci Detayı' }} // ✅ istediğin isim
        />
        <Stack.Screen
          name="add-student"
          options={{title: "Öğrenci Ekleme"}}
          />
      </Stack>
    </PaperProvider>
  );
}
