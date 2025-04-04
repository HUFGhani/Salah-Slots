import {getPayloadConfig} from "./getPayloadConfig"

const mockSSM = jest.fn();
const mockSend = jest.fn();

jest.mock("@aws-sdk/client-ssm", () => ({
  GetParametersCommand: function GetParametersCommand({ name, WithDecryption }) {
    mockSSM({ name, WithDecryption });
    return {
      name,
      WithDecryption,
    };
  },
  SSMClient: function SSMClient() {
    return {
      send: () => mockSend(),
    };
  },
}));

describe("getPayloadConfig", () => {
  it("should return month and year form ssm", async () => {
    mockSSM.mockReturnValue({
      name: ["month", "year"],
      WithDecryption: false,
    });
    mockSend.mockResolvedValue({
      Parameters: [
        { Value: "March" },
        { Value: "2025" },
      ],
    });
  
    const { month, year } = await getPayloadConfig();

    expect(month).toBe("March");
    expect(year).toBe("2025");
    });
  });

