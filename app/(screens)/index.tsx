import { View, Text, ScrollView, Button } from 'react-native';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Index = () => {
  const [data, setData] = useState<string | null>(null);

  const readDB = async () => {
    const json = await AsyncStorage.getItem('students');
    setData(json);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Button title="Veritabanını Görüntüle" onPress={readDB} />
      {data && (
        <Text style={{ marginTop: 16, fontSize: 12, fontFamily: 'monospace' }}>
          {data}
        </Text>
      )}
    </ScrollView>
  );
};

export default Index;
