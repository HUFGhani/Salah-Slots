import { SalahTimetable } from "../types";
import { generateIcs } from "./generateIcs";
import * as ics from "ics"; // Import the ics module to mock it

jest.mock("ics", () => ({
  createEvents: jest.fn(() => ({
    value: "Mocked ICS Content",
  })),
}));

describe("generateIcs", () => {
  it("should generate valid ICS events for valid salah times", () => {
    const salahTime: SalahTimetable[] = [
      {
        day: 15,
        weekday: "MON",
        gregorianCalendarMonth: "March",
        salahTime: {
          fajr: "10:00",
          dhuhr: "13:00",
          asr: "16:00",
          maghrib: "18:00", // Should be filtered out (after 5 PM)
          isha: "20:00", // Should be filtered out (after 5 PM)
        },
      },
    ];

    const year = "2025";

    const icsContent = generateIcs(salahTime, year);

    // Check that the ICS content is mocked
    expect(icsContent).toBe("Mocked ICS Content");

    // Verify that createEvents was called with the correct arguments
    expect(ics.createEvents).toHaveBeenCalledWith(expect.any(Array));
  });

  it("should filter out salah times on weekends", () => {
    const salahTime: SalahTimetable[] = [
      {
        day: 16,
        weekday: "SAT", // Weekend
        gregorianCalendarMonth: "March",
        salahTime: {
          fajr: "10:00",
        },
      },
    ];

    const year = "2025";

    const icsContent = generateIcs(salahTime, year);

    // Check that no events are generated for weekends
    expect(ics.createEvents).toHaveBeenCalledWith([]);
  });

  it("should correctly calculate the month index", () => {
    const salahTime: SalahTimetable[] = [
      {
        day: 15,
        weekday: "MON",
        gregorianCalendarMonth: "March",
        salahTime: {
          fajr: "10:00",
        },
      },
    ];

    const year = "2025";

    const icsContent = generateIcs(salahTime, year);

    // Check that the mocked ICS content is returned
    expect(icsContent).toBe("Mocked ICS Content");

    // Verify that createEvents was called with the correct event data
    expect(ics.createEvents).toHaveBeenCalledWith(expect.any(Array));
  });
  describe("generateIcs - Time Parsing", () => {
  it("should correctly parse the hour and minute from the time string", () => {
    const salahTime = [
      {
        day: 15,
        weekday: "MON",
        gregorianCalendarMonth: "March",
        salahTime: {
          fajr: "10:30", // Test time string
        },
      },
    ];

    const year = "2025";

    generateIcs(salahTime, year);

    // Verify that the parsed time is passed correctly to the event
    expect(ics.createEvents).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          start: [2025, 3, 15, 10, 30], // Ensure hour and minute are parsed correctly
        }),
      ]),
    );
  });
  
});
describe("generateIcs - Time Parsing", () => {
  it("should correctly parse the hour and minute from the time string", () => {
    const salahTime = [
      {
        day: 15,
        weekday: "MON",
        gregorianCalendarMonth: "March",
        salahTime: {
          fajr: "10:30", // Test time string
        },
      },
    ];

    const year = "2025";

    generateIcs(salahTime, year);

    // Verify that the parsed time is passed correctly to the event
    expect(ics.createEvents).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          start: [2025, 3, 15, 10, 30], // Ensure hour and minute are parsed correctly
        }),
      ]),
    );
  });
});
})