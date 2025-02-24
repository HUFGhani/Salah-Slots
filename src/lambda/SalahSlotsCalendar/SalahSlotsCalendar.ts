import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import * as pdfParse from "pdf-parse";

const fetchFile = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {
  try {
    const fileBuffer: Buffer = await fetchFile(
      "https://manchestercentralmosque.org/wp-content/uploads/2023/12/VP-JANURAY-2024-PRAYER-TIMETABLE.pdf"
    );

    console.log(`File fetched with size: ${fileBuffer.length} bytes`);

    const pdfData = await pdfParse(fileBuffer);
    console.log(pdfData.text);

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/plain" },
      body: `Extracted PDF text:\n\n${pdfData.text}`,
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
