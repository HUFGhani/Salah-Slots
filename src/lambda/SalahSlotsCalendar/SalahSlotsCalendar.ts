import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import * as pdfParse from "pdf-parse";



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


const salahTimeRegex = /(\d{1,2})\s*([a-zA-Z]{3})\s*(\d{1,2})\s*(\d{1,2}:\d{1,2})\s*(\d{1,2}:\d{1,2})\s*(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s(\d{1,2}:\d{1,2})\s{2}(\d{1,2}:\d{1,2})/gm

const fetchFile = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

const parseSalahTime = (text: string, salahTimeRegex: RegExp) : SalahTimetable[] =>{
 
  const cleanedText = text.replace(/\n/g, " ");
  const matches: RegExpExecArray[] = Array.from(cleanedText.matchAll(salahTimeRegex))

  if (!matches) {
    console.log("No prayer times found.");
  }

  return matches.map((match:RegExpExecArray)=>{
    return {
      day: match[0],
      weekday: match[2],
      salahTime:{
        fajar: match[4] || "",
        zhuhr: match[6] || "",
        asr: match[7] || "",
        maghrib: match[14] || "",
        isha: match[10] || ""
      }
    }
  })
  
}



export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const fileBuffer: Buffer = await fetchFile("https://drive.google.com/uc?export=download&id=1jqmPbY4xRkX7dDvlqGvc3OKV_3K4NKGD"
     // "https://drive.google.com/file/d/1jqmPbY4xRkX7dDvlqGvc3OKV_3K4NKGD/view?usp=sharing"
    );

    console.log(`File fetched with size: ${fileBuffer.length} bytes`);

    const pdfData = await pdfParse(fileBuffer);
 
    const SalahTimetable = parseSalahTime(pdfData.text, salahTimeRegex)

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Extracted PDF text: ${JSON.stringify(SalahTimetable)}`,
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
