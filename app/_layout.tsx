// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font'; // useFonts hook'unu import ediyoruz
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen'; // SplashScreen'ı import ediyoruz
import { useEffect } from 'react'; // useEffect'i import ediyoruz


import { useColorScheme } from '@/hooks/useColorScheme';

// Sıçrama ekranının otomatik gizlenmesini engelle
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // İkon fontlarını ve diğer özel fontları yüklüyoruz
  const [fontsLoaded, fontError] = useFonts({
    // Mevcut fontunuzu koruyalım
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    
    // React Native Paper ve @expo/vector-icons için gerekli ikon fontları
    // MaterialCommunityIcons, çoğu ikonunuzu ve Paper'ın bazı bileşenlerini kapsar.
    'MaterialCommunityIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
    // MaterialIcons, Paper'ın varsayılan ikon seti olabilir ve Checkbox gibi yerlerde kullanılır.
    'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
    // Eğer Ionicons veya FontAwesome da kullanıyorsanız, onları da buraya eklemelisiniz.
    // 'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
    // 'FontAwesome': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf'),
  });

  // Fontlar yüklendiğinde veya bir hata oluştuğunda SplashScreen'ı gizle
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Fontlar yüklenene kadar hiçbir şey gösterme
  if (!fontsLoaded && !fontError) {
    return null;
  }

  // Fontlar yüklendikten sonra uygulamayı render et
  return (
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(screens)" options={{headerShown: false}}/>
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </PaperProvider>
  );
}