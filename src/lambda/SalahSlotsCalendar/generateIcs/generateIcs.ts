import * as ics from "ics";
import { DateTime } from "luxon";
import { SalahTimetable } from "../types";

export const generateIcs = (salahTime: SalahTimetable[], year: string) => {
  const events: ics.EventAttributes[] = salahTime.flatMap(
    ({ day, weekday, gregorianCalendarMonth, salahTime }) => {
      return Object.entries(salahTime)
        .map(([salahName, time]) => {
          const [hour, minute] = time.split(":").map(Number);

          if (hour < 9 || hour >= 17 || ["SAT", "SUN"].includes(weekday)) {
            return null;
          }

          const date = new Date();
          const monthIndex =
            new Date(
              date.getFullYear(),
              new Date(`${gregorianCalendarMonth} 1`).getMonth(),
            ).getMonth() + 1;
          const salah = salahName.charAt(0).toUpperCase() + salahName.slice(1);

          const dt = DateTime.fromObject(
            {
              year: Number(year),
              month: monthIndex,
              day: day,
              hour: hour,
              minute,
            },
            { zone: "Europe/London" },
          ).toUTC();

          return {
            title: `${salah} Prayer Time`,
            start: [dt.year, dt.month, dt.day, dt.hour, dt.minute],
            description: `Time to read ${salah} salah `,
            duration: { minutes: 15 },
            status: "CONFIRMED",
            busyStatus: "BUSY",
            startInputType: "utc",
            startOutputType: "utc",
            endInputType: "utc",
            endOutputType: "utc",
            productId: "SalahSlots/ics",
            calName: "Salah Slots",
            alarms: [
              {
                action: "audio",
                description: `${salah} Prayer Time`,
                summary: `${salah} Prayer Time`,
                trigger: { minutes: 10, before: true },
                attach: "Glass",
              },
            ],
          } as ics.EventAttributes;
        })
        .filter((event): event is ics.EventAttributes => event !== null);
    },
  );

  const { value } = ics.createEvents([...events]);

  return value;
};
