import { APIGatewayEvent, Context } from "aws-lambda";


const fetchFile = async (url: string): Promise<Buffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
};

export const handler = async (event : APIGatewayEvent, context: Context) => {

  const file = await fetchFile("https://manchestercentralmosque.org/wp-content/uploads/2023/12/VP-JANURAY-2024-PRAYER-TIMETABLE.pdf")
  .then(buffer => console.log(`File fetched with size: ${buffer.length} bytes`))
  .catch(console.error);


    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `Hello, CDK! You've hit ${event}\n`
      };
    
}