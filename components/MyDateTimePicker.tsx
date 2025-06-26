import React from 'react';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface MyDateTimePickerProps {
  value: Date;
  onChange: (event: DateTimePickerEvent, date?: Date) => void;
  // Burada mobil için gerekli diğer prop'ları da tanımlayabilirsiniz (mode, display vb.)
  mode?: 'date' | 'time' | 'datetime';
}

const MyDateTimePicker: React.FC<MyDateTimePickerProps> = ({ value, onChange, mode = 'date' }) => {
  return (
    <DateTimePicker
      value={value}
      mode={mode}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'} // iOS için spinner, Android için varsayılan
      onChange={onChange}
    />
  );
};

export default MyDateTimePicker;