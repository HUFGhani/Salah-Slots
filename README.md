# Salah Slots Calendar

## Overview

The Salah Slots Calendar project is a serverless application that generates an iCalendar (.ics) file containing daily Salah (prayer) times. It fetches prayer times from a website, parses the HTML content, and converts the data into the iCalendar format. The application is built using AWS Lambda, API Gateway, CloudFront, and other AWS services.

## Features

*   **Fetches Salah Times:** Retrieves prayer times for a specific month and year from a designated website (e.g., Manchester Central Mosque).
*   **Parses HTML:** Extracts relevant prayer time data from the HTML content of the website. See [`parseSalahTime`](src/lambda/SalahSlotsCalendar/parseSalahTime/parseSalahTime.ts)
*   **Generates iCalendar File:** Creates an `.ics` file containing the prayer times, allowing users to import the schedule into their calendar applications. See [`generateIcs`](src/lambda/SalahSlotsCalendar/generateIcs/index.ts)
*   **Serverless Architecture:** Deployed as an AWS Lambda function, providing scalability and cost-efficiency.
*   **Configurable:** Uses SSM parameters to configure the month and year for which to generate the calendar.
*   **Cached Distribution:** Uses CloudFront to cache the generated `.ics` file for faster access.

## Technologies Used

*   **TypeScript:** Primary programming language.
*   **AWS Lambda:** Serverless compute service for running the application logic.
*   **AWS API Gateway:**  (Implicitly used via Lambda Function URL) Provides an HTTP endpoint to trigger the Lambda function.
*   **AWS CloudFront:** Content Delivery Network (CDN) for caching and distributing the generated iCalendar file.
*   **AWS CDK:** Infrastructure as Code (IaC) tool for defining and provisioning AWS resources.
*   **jsdom:** Used for parsing HTML content in a Node.js environment.
*   **ical.js:** Used for generating the iCalendar file.
*   **Jest:** Testing framework for unit tests.

## Architecture

The application follows a serverless architecture:

1.  **Client Request:** A client (e.g., a user's calendar application) sends an HTTP request to the CloudFront distribution URL.
2.  **CloudFront Cache:** CloudFront checks if the requested iCalendar file is already cached. If so, it returns the cached response.
3.  **Lambda Function Invocation:** If the file is not cached, CloudFront forwards the request to the Lambda Function URL.
4.  **Salah Time Retrieval:** The Lambda function fetches the prayer times from the external website using the [`fetchSalahTimeTable`](src/lambda/SalahSlotsCalendar/SalahSlotsCalendar.ts) function.
5.  **HTML Parsing:** The [`parseSalahTime`](src/lambda/SalahSlotsCalendar/parseSalahTime/parseSalahTime.ts) function parses the HTML response to extract the prayer times.
6.  **iCalendar Generation:** The [`generateIcs`](src/lambda/SalahSlotsCalendar/generateIcs/index.ts) function generates the iCalendar file based on the parsed prayer times.
7.  **Response:** The Lambda function returns the iCalendar file as the HTTP response.
8.  **Caching:** CloudFront caches the response for future requests.
9.  **Client Receives iCalendar:** The client receives the iCalendar file and imports it into their calendar application.

## Infrastructure Setup

The infrastructure is defined using AWS CDK in the `/infrastructure` directory.

### Prerequisites

*   AWS CLI configured with appropriate credentials.
*   Node.js and npm installed.
*   AWS CDK Toolkit installed (`npm install -g aws-cdk`).

### Deployment Instructions

1.  Navigate to the `infrastructure` directory:

    ```bash
    cd infrastructure
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Synthesize the CloudFormation template:

    ```bash
    cdk synth
    ```

4.  Deploy the stack to your AWS account:

    ```bash
    cdk deploy
    ```

    *   Note: You may need to specify the AWS account and region if you haven't configured them as default.

5.  After deployment, the CloudFront distribution URL will be displayed as an output.  See [`SalahSlotsInfrastructureStack`](infrastructure/lib/SalahSlotsInfrastructure-stack.ts)

### Configuration

The application uses AWS SSM Parameter Store to configure the month and year for which to generate the calendar.  You can update these parameters in the AWS console or using the AWS CLI.

## Code Structure

*   `/infrastructure`: Contains the AWS CDK code for defining the infrastructure.
    *   `/lib`: Defines the CDK stack. See [`SalahSlotsInfrastructureStack`](infrastructure/lib/SalahSlotsInfrastructure-stack.ts)
    *   `/test`: Contains integration tests for the infrastructure. See [`infrastructure.test.ts`](infrastructure/test/infrastructure.test.ts)
*   `/src/lambda/SalahSlotsCalendar`: Contains the code for the AWS Lambda function.
    *   `SalahSlotsCalendar.ts`: The main handler function for the Lambda. See [`handler`](src/lambda/SalahSlotsCalendar/SalahSlotsCalendar.ts)
    *   `/parseSalahTime`: Contains the logic for parsing the HTML content. See [`parseSalahTime`](src/lambda/SalahSlotsCalendar/parseSalahTime/parseSalahTime.ts)
    *   `/generateIcs`: Contains the logic for generating the iCalendar file. See [`generateIcs`](src/lambda/SalahSlotsCalendar/generateIcs/generateIcs.ts)
    *   `/formatTime`: Contains the logic for formatting time. See [`formatTime`](src/lambda/SalahSlotsCalendar/formatTime/formatTime.ts)
    *   `/getPayloadConfig`: Contains the logic for getting the month and year from SSM. See [`getPayloadConfig`](src/lambda/SalahSlotsCalendar/getPayloadConfig/getPayloadConfig.ts)

## Testing

### Infrastructure Tests

Located in the `/infrastructure/test` directory.  Uses Jest for testing.

To run the infrastructure tests:

```bash
cd infrastructure
npm run test
```

### Lambda Function Tests
Located in the SalahSlotsCalendar directory. Uses Jest for testing.

To run the Lambda function tests:

```bash
cd src/lambda/SalahSlotsCalendar
npm run test
```
