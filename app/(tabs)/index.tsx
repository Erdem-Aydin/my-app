import { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, Card, FAB, Appbar, Checkbox } from 'react-native-paper';
import { useFocusEffect, useRouter } from 'expo-router';
import type { Student } from '../../types/student';
import { STORAGE_KEY } from '@/constants/storage';
import { calculateRemainingClasses } from '@/utils/student-utils';

export default function StudentListScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const router = useRouter();

  useFocusEffect(() => {
    const loadStudents = async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStudents(JSON.parse(stored));
      }
    };
    loadStudents();
  });

  const deleteSelectedStudents = async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const current: Student[] = stored ? JSON.parse(stored) : [];
    const filtered = current.filter(s => !selectedIds.includes(s.id));
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    setStudents(filtered);
    setSelectionMode(false);
    setSelectedIds([]);
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Öğrenciler" />
        {selectionMode ? (
          <>
            <Appbar.Action icon="delete" onPress={deleteSelectedStudents} />
            <Appbar.Action icon="close" onPress={() => {
              setSelectionMode(false);
              setSelectedIds([]);
            }} />
          </>
        ) : null}
      </Appbar.Header>

      <View style={{ flex: 1, padding: 16 }}>
        <FlatList
          data={[...students].sort((a, b) =>
            calculateRemainingClasses(a) - calculateRemainingClasses(b)
          )}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onLongPress={() => {
                setSelectionMode(true);
                setSelectedIds([item.id]);
              }}
              onPress={() => {
                if (selectionMode) {
                  if (selectedIds.includes(item.id)) {
                    setSelectedIds(prev => prev.filter(id => id !== item.id));
                  } else {
                    setSelectedIds(prev => [...prev, item.id]);
                  }
                } else {
                  router.push(`../(screens)/student-detail?id=${item.id}`);
                }
              }}
            >
              <Card style={{ marginBottom: 12 }}>
                <Card.Title
                  title={item.StudentName}
                  subtitle={(() => {
                    const count = calculateRemainingClasses(item);
                    if (count > 0) {
                      return `${item.Day} • Kalan Ders: ${count}`;
                    } else if (count === 0) {
                      return `${item.Day} • Tüm dersler yapıldı`;
                    } else {
                      return `${item.Day} • Tüm dersler yapıldı • ${-count} ekstra ders yapıldı`;
                    }
                  })()}
                  right={() => selectionMode ? (
                    <Checkbox
                      status={selectedIds.includes(item.id) ? 'checked' : 'unchecked'}
                      onPress={() => {
                        if (selectedIds.includes(item.id)) {
                          setSelectedIds(prev => prev.filter(id => id !== item.id));
                        } else {
                          setSelectedIds(prev => [...prev, item.id]);
                        }
                      }}
                    />
                  ) : null}
                />
              </Card>
            </TouchableOpacity>
          )}
        />

        {!selectionMode && (
          <FAB
            icon="plus"
            label="Öğrenci Ekle"
            onPress={() => router.push('../(screens)/add-student')}
            style={{ position: 'absolute', right: 16, bottom: 16 }}
          />
        )}
      </View>
    </View>
  );
}
