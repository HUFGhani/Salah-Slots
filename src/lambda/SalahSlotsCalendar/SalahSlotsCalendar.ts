import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
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
      salahTime: {
        fajar: formatTime(cells[3].textContent!.trim()),
        zhuhr: formatTime(cells[6].textContent!.trim()),
        asr: formatTime(cells[7].textContent!.trim()),
        maghrib: formatTime(cells[13].textContent!.trim()),
        isha: formatTime(cells[9].textContent!.trim()),
      },
    });
  });
 

  return salahTimetable;
};

const formatTime = (time: string): string => {
  return time.replace(".", ":");
};

export const handler = async (
  event: APIGatewayEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  try {
    const rawhtmlSalahTimetable = await fetchSalahTimeTable("Mar", "2025");
    const salahTimetable = parseSalahTime(rawhtmlSalahTimetable);

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Extracted PDF text: ${JSON.stringify(salahTimetable)}`,
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
