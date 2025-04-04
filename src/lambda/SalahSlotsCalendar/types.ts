export interface SalahTime {
  fajar: String;
  zhuhr: String;
  asr: String;
  maghrib: String;
  isha: String;
}

export interface SalahTimetable {
  day: number;
  weekday: string;
  gregorianCalendarMonth: string;
  islamicCalendarMonth?: string;
  salahTime: SalahTime;
}

export type Weekday = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";
