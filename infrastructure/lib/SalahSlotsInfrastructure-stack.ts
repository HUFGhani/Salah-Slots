import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class SalahSlotsInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunc = new lambda.Function(this, "SalahSlots", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "SalahSlotsCalendar.handler",
      code: lambda.Code.fromAsset("../src/lambda/SalahSlotsCalendar"),
      timeout: cdk.Duration.seconds(30),
    });

    const version = lambdaFunc.currentVersion;

    const alias = new lambda.Alias(this, "LambdaAlias", {
      aliasName: "Prod",
      version,
    });

    const lambdaUrl = lambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });
  }
}
