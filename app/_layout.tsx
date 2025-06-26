// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';

// MaterialCommunityIcons'ın kendisini doğrudan import edelim,
// Bu bazen font dosyasının yolunu otomatik olarak bulmasına yardımcı olabilir.
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

// Sıçrama ekranının otomatik gizlenmesini engelle
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    
    // YENİ YAKLAŞIM: MaterialCommunityIcons'ın kendisinden fontu almayı deneyelim
    // Bu, paketin kendi içindeki yol çözme mekanizmasını kullanır.
    'MaterialCommunityIcons': MaterialCommunityIcons.font,
    
    // Paper'ın varsayılan ikon fontu: MaterialIcons veya başka bir şey olabilir.
    // Varsayılan olarak MaterialIcons'ı da yükleyelim ki Paper bileşenleri (checkbox gibi) düzgün çalışsın.
    // Eğer MaterialCommunityIcons ile çalışmazsa, Paper'ın kendi ayarını kullanabiliriz:
    // https://callstack.github.io/react-native-paper/docs/guides/icons/
    'MaterialIcons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.ttf'),
    'FontAwesome': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/FontAwesome.ttf'),
    'Ionicons': require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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