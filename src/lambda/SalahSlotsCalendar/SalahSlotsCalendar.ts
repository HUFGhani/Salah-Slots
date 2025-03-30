import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";
import { APIGatewayEvent, Context } from "aws-lambda";
import * as ics from "ics";
import { JSDOM } from "jsdom";

interface SalahTime {
  fajar: String;
  zhuhr: String;
  asr: String;
  maghrib: String;
  isha: String;
}

interface SalahTimetable {
  day: number;
  weekday: string;
  gregorianCalendarMonth: string;
  islamicCalendarMonth?: string;
  salahTime: SalahTime;
}

const fetchSalahTimeTable = async (
  month: string,
  year: string,
): Promise<string> => {
  const response = await fetch(
    "https://manchestercentralmosque.org/wp-admin/admin-ajax.php",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie:
          "_gid=GA1.2.408892989.1741961752; _gat_gtag_UA_193651382_1=1; _ga=GA1.1.276763202.1741961752; _ga_DQQQT9Q09D=GS1.1.1741961752.1.1.1741961762.0.0.0",
        Referer: "https://manchestercentralmosque.org/prayer-times/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `current_file=${month}+${year}&action=mcm_get_month_file`,
      method: "POST",
    },
  );
  return response.text();
};

const parseSalahTime = (html: string): SalahTimetable[] => {
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

const isWorkingHours = (hour: number): boolean => hour < 9 && hour >= 17;

const isItWorkday = (weekday: string): boolean =>
  weekday != "SAT" && weekday != "SUN";


const generateIcs = (salahTime: SalahTimetable[], year: string) => {
  const events: ics.EventAttributes[] = salahTime.flatMap(
    ({ day, weekday, gregorianCalendarMonth, salahTime }) => {
      return Object.entries(salahTime)
        .map(([salahName, time]) => {
          const [hour, minute] = time.split(":").map(Number);

          isWorkingHours(hour);

          isItWorkday(weekday);

          const date = new Date();
          const monthIndex =
            new Date(
              date.getFullYear(),
              new Date(`${gregorianCalendarMonth} 1`).getMonth(),
            ).getMonth() + 1;
          const salah = salahName.charAt(0).toUpperCase() + salahName.slice(1);

          return {
            title: `${salah} Prayer Time`,
            start: [
              Number(year),
              monthIndex,
              day,
              Number(hour),
              Number(minute),
            ],
            description: `Time to read ${salah} salah `,
            duration: { minutes: 15 },
            status: "CONFIRMED",
            busyStatus: "BUSY",
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

const formatTime = (
  time: string,
  salahName?: string,
  isPm: boolean = true,
): string => {
  if (salahName === "fajar") {
    return time.replace(".", ":");
  }

  let [hours, minutes] = time.split(".");
  hours = hours === "12" ? "00" : hours;
  if (isPm) {
    hours = String(Number(hours) + 12);
  }
  return `${hours}:${minutes}`;
};

const getPayloadConfig = async (): Promise<{
  month: string | undefined;
  year: string | undefined;
}> => {
  try {
    const client = new SSMClient();
    const input = {
      Names: [
        "/SalahSlots/GetPayloadConfig/Month",
        "/SalahSlots/GetPayloadConfig/Year",
      ],
      WithDecryption: false,
    };
    const command = new GetParametersCommand(input);
    const response = await client.send(command);
    if (response.Parameters?.length == 0) {
      throw new Error("Parameters does not have vaules");
    }
    return {
      month: response.Parameters?.[0].Value,
      year: response.Parameters?.[1].Value,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const handler = async (event: APIGatewayEvent, context: Context) => {
  const { month, year } = await getPayloadConfig();
  try {
    const rawhtmlSalahTimetable = await fetchSalahTimeTable(
      String(month),
      String(year),
    );
    const salahTimetable = parseSalahTime(rawhtmlSalahTimetable);
    const salahIcsFile = generateIcs(salahTimetable, String(year));

    console.log(salahIcsFile);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="salah.ics"',
        "Access-Control-Allow-Origin": "*",
      },
      body: salahIcsFile,
    };
  } catch (error) {
    console.error("Error processing PDF:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain" },
      body: "Internal Server Error",
    };
  }
};
