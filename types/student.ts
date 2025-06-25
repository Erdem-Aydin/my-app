export type StudentType = 'bireysel' | 'grup';

export type Weekday =
  | 'Pazartesi'
  | 'Salı'
  | 'Çarşamba'
  | 'Perşembe'
  | 'Cuma'
  | 'Cumartesi'
  | 'Pazar';

export type Student = {
  id: string;
  StudentName: string;
  Type: StudentType;
  Day: Weekday;
  LastPaidDate: string; // ISO Date string
  UpdatedPaymentDate: string; // ISO Date string
  FreeAbsanceUsed: boolean;
  TeacherCanceledClassNum: number;
  ExtraClassNum: number;
  RemainingClassCount: number;
};
