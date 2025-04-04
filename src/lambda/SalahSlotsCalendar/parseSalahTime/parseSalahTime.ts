import { SalahTimetable } from "../types";
import { JSDOM } from "jsdom";
import { formatTime } from "../formatTime";

export const parseSalahTime = (html: string): SalahTimetable[] => {
  const salahTimetable: SalahTimetable[] = [];
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const rows = doc.querySelectorAll("table tr");

  let month = "";
  const firstRowCells = rows[1]?.querySelectorAll("td");
  if (firstRowCells && firstRowCells.length > 0) {
    month = firstRowCells[0].textContent!.trim();
  }

  rows.forEach((row, index) => {
    if (index === 0 || index === 1) {
      return;
    }
    const cells = row.querySelectorAll("td");

    if (isNaN(+cells[0].textContent!.trim())) {
      return;
    }

    salahTimetable.push({
      day: Number(cells[0].textContent!.trim()),
      weekday: cells[1].textContent!.trim(),
      gregorianCalendarMonth:
        month[0].toUpperCase() + month.slice(1).toLowerCase(),
      salahTime: {
        fajar: formatTime(cells[3].textContent!.trim(), "fajar", false),
        zhuhr: formatTime(cells[6].textContent!.trim()),
        asr: formatTime(cells[7].textContent!.trim()),
        maghrib: formatTime(cells[13].textContent!.trim()),
        isha: formatTime(cells[9].textContent!.trim()),
      },
    });
  });

  return salahTimetable;
};
