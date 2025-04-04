import { parseSalahTime } from "./parseSalahTime";

const sampleHTML = `
<table>
  <tr><th>Header</th></tr>
  <tr><td>April</td></tr>
  <tr>
    <td>1</td>
    <td>MON</td>
    <td></td><td>5.30</td> <!-- Fajar -->
    <td></td><td></td><td>1.00</td> <!-- Zhuhr -->
    <td>4.30</td> <!-- Asr -->
    <td></td><td>9.00</td> <!-- Isha -->
    <td></td><td></td><td></td><td>7.45</td> <!-- Maghrib -->
  </tr>
</table>
`;

describe("parseSalahTime", () => {
  it("parses correct timetable from HTML", () => {
    const timetable = parseSalahTime(sampleHTML);
    expect(timetable.length).toBe(1);
    expect(timetable[0].salahTime.fajar).toBe("5:30");
    expect(timetable[0].salahTime.zhuhr).toBe("13:00");
    expect(timetable[0].salahTime.asr).toBe("16:30");
    expect(timetable[0].salahTime.maghrib).toBe("19:45");
    expect(timetable[0].salahTime.isha).toBe("21:00");
  });
});
