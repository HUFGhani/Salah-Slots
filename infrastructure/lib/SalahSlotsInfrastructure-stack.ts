import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";

export class SalahSlotsInfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaExecutionRole = new iam.Role(this, "LambdaExecutionRole", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole",
        ),
      ],
    });

    const lambdaFunc = new lambda.Function(this, "SalahSlots", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "SalahSlotsCalendar.handler",
      code: lambda.Code.fromAsset("../src/lambda/SalahSlotsCalendar"),
      timeout: cdk.Duration.seconds(30),
      role: lambdaExecutionRole,
    });

    const getparametersExecutionPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["ssm:GetParameters"],
      resources: ["*"],
    });

    lambdaExecutionRole.addToPolicy(getparametersExecutionPolicy);

    const version = lambdaFunc.currentVersion;

    const alias = new lambda.Alias(this, "LambdaAlias", {
      aliasName: "Prod",
      version,
    });

    const lambdaUrl = lambdaFunc.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    const distribution = new cloudfront.Distribution(this, "SalahSlotsDistribution", {
      defaultBehavior: {
        origin: new origins.HttpOrigin("eowrbmqwdyy7zpxwkm5fgl6jt40llhwa.lambda-url.eu-west-2.on.aws"), // Use Lambda Function URL as origin
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, // Disable caching for dynamic content
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
    });

    new cdk.CfnOutput(this, "CloudFrontURL", {
      value: distribution.domainName,
      description: "The CloudFront distribution URL",
    });
  
  }
}
