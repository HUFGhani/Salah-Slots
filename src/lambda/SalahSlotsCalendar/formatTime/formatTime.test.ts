import { formatTime } from "./formatTime";
describe("formatTime", () => {
  it("formats Fajar time (AM)", () => {
    expect(formatTime("5.30", "fajar", false)).toBe("5:30");
  });

  it("formats Zohar (PM)", () => {
    expect(formatTime("1.15")).toBe("13:15");
  });

  it("converts 12 PM to 12:00", () => {
    expect(formatTime("12.00")).toBe("12:00");
  });

  it("handles 12 as 00 internally before PM offset", () => {
    expect(formatTime("12.00", "maghrib", true)).toBe("12:00");
  });
});
