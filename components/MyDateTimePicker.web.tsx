import React from 'react';
import DatePicker from 'react-datepicker';
// React Datepicker'ın kendi stillerini ve sonra bizim özel stilimizi import ediyoruz
import '..//assets/styles/custom-datepicker.css'; // BURADA KENDİ OLUŞTURDUĞUNUZ CSS DOSYASINI IMPORT EDİN
import { View, Platform } from 'react-native';

interface MyDateTimePickerProps {
  value: Date;
  onChange: (event: any, date?: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
}

const MyDateTimePicker: React.FC<MyDateTimePickerProps> = ({ value, onChange, mode = 'date' }) => {
  const handleDateChange = (date: Date | null) => {
    if (date) {
      onChange({ type: 'set', nativeEvent: { timestamp: date.getTime() } }, date);
    } else {
      onChange({ type: 'dismissed', nativeEvent: {} });
    }
  };

  const showTimeSelect = mode === 'datetime' || mode === 'time';
  const dateFormat = mode === 'date' ? 'dd/MM/yyyy' : (mode === 'time' ? 'HH:mm' : 'dd/MM/yyyy HH:mm');

  return (
    <View style={{ marginBottom: 12 }}>
      <DatePicker
        selected={value}
        onChange={handleDateChange}
        showTimeSelect={showTimeSelect}
        showTimeSelectOnly={mode === 'time'}
        dateFormat={dateFormat}
        // İsteğe bağlı olarak bu prop'u silebilirsiniz, çünkü CSS'imiz daha genel
        // calendarContainer={({ children }) => (
        //   <View style={{ backgroundColor: 'white', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#ccc', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        //     {children}
        //   </View>
        // )}
      />
    </View>
  );
};

export default MyDateTimePicker;