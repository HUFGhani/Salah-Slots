import { GetParametersCommand, SSMClient } from "@aws-sdk/client-ssm";

export const getPayloadConfig = async (): Promise<{
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

    const month = response.Parameters?.[0].Value;
    const year = response.Parameters?.[1].Value;

    return {
      month,
      year,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
