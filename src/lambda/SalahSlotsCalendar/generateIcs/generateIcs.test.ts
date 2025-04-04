import { generateIcs } from "./generateIcs";

jest.mo;
describe("generateIcs", () => {
  it("should generates valid ICS for workdays within 9-17", () => {
    const sampleTimetable = [
      {
        day: 1,
        weekday: "MON",
        gregorianCalendarMonth: "April",
        salahTime: {
          fajar: "05:30",
          zhuhr: "13:00",
          asr: "16:30",
          maghrib: "19:45",
          isha: "21:15",
        },
      },
    ];
    const icsString = generateIcs(sampleTimetable, "2025");

    expect(icsString).toContain("BEGIN:VCALENDAR");
    expect(icsString).toContain("SUMMARY:Zhuhr Prayer Time");
    expect(icsString).toContain("SUMMARY:Asr Prayer Time");

    expect(icsString).not.toContain("Fajar");
    expect(icsString).not.toContain("Maghrib");
    expect(icsString).not.toContain("Isha");
  });
});
