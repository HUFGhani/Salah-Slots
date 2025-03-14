import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";



interface SalahTime {
  fajar: String,
  zhuhr: String,
  asr: String,
  maghrib: String
  isha: String
}

interface SalahTimetable {
  day: string,
  weekday: string
  salahTime : SalahTime 
}


const fetchSalahTimeTable = async(month:string, year:string):Promise<string>=>{
  const response = await fetch("https://manchestercentralmosque.org/wp-admin/admin-ajax.php", {
    headers: {
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "sec-ch-ua": '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "cookie": "_gid=GA1.2.408892989.1741961752; _gat_gtag_UA_193651382_1=1; _ga=GA1.1.276763202.1741961752; _ga_DQQQT9Q09D=GS1.1.1741961752.1.1.1741961762.0.0.0",
        "Referer": "https://manchestercentralmosque.org/prayer-times/",
        "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    body: `current_file=${month}+${year}&action=mcm_get_month_file`,
    method: "POST"
});
return response.text();
}


const parseSalahTime = (html):SalahTimetable[] =>{
const salahTimetable: SalahTimetable = []

return salahTimetable
}

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {

    const rawhtmlSalahTimetable = await fetchSalahTimeTable("Mar", "2025")
    const salahTimetable = parseSalahTime(rawhtmlSalahTimetable)

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
