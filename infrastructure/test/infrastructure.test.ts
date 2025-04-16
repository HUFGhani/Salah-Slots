import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { SalahSlotsInfrastructureStack } from "../lib/SalahSlotsInfrastructure-stack";

describe("SalahSlotsInfrastructureStack", () => {
  let app: cdk.App;
  let stack: SalahSlotsInfrastructureStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new SalahSlotsInfrastructureStack(app, "TestStack");
    template = Template.fromStack(stack);
  });

  it("should create a Lambda function with the correct properties", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs22.x",
      Handler: "SalahSlotsCalendar.handler",
      Timeout: 30,
    });
  });

  it("should create an IAM role with the correct managed policy", () => {
    template.hasResourceProperties("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: "sts:AssumeRole",
            Effect: "Allow",
            Principal: {
              Service: "lambda.amazonaws.com",
            },
          },
        ],
      },
      ManagedPolicyArns: [
        {
          "Fn::Join": [
            "",
            [
              "arn:",
              { Ref: "AWS::Partition" },
              ":iam::aws:policy/service-role/AWSLambdaBasicExecutionRole",
            ],
          ],
        },
      ],
    });
  });

  it("should create a custom cache policy with a 28-day TTL", () => {
    template.hasResourceProperties("AWS::CloudFront::CachePolicy", {
      CachePolicyConfig: {
        DefaultTTL: 2419200, // 28 days in seconds
        MaxTTL: 2419200,
        MinTTL: 0,
        Name: "salah-slots-cache-policy",
      },
    });
  });

  it("should create a Lambda function URL with no authentication", () => {
    template.hasResourceProperties("AWS::Lambda::Url", {
      AuthType: "NONE",
    });
  });

  it("should output the CloudFront distribution URL", () => {
    template.hasOutput("CloudFrontURL", {
      Description: "The CloudFront distribution URL",
    });
  });
});