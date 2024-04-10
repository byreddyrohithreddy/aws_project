const { DynamoDBClient, SendCommandCommand } = require("@aws-sdk/client-dynamodb");
const { EC2Client, RunInstancesCommand } = require("@aws-sdk/client-ec2");
const { encode } = require('base-64');

const AWS_REGION = 'us-west-1';


const ec2Client = new EC2Client({ region: AWS_REGION });
const dynamodbClient = new DynamoDBClient({ region: AWS_REGION });

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    if (event.Records[0].eventName === "INSERT") {
        const id = event.Records[0].dynamodb.Keys.id.S;
        console.log(id);

        console.log("Starting EC2 instance");

        const userData = `#!/bin/bash
            sudo apt update
            sudo apt install -y python3-pip
            pip install boto3
            sudo apt install unzip
            curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
            unzip awscliv2.zip
            sudo ./aws/install
            aws s3 cp s3://input-form-rohith/output.py output.py
            python3 output.py ${id}`;

        const encodedUserData = encode(userData);

        console.log("Started executing script");

        try {
            const instanceParams = {
                ImageId: 'ami-05c969369880fa2c2',
                InstanceType: 't2.micro',
                MinCount: 1,
                MaxCount: 1,
                UserData: encodedUserData,
                SecurityGroupIds: ['sg-09e10352ec3721e7a'],
                KeyName: 'data-key',
                IamInstanceProfile: { Arn: 'arn:aws:iam::081053450501:instance-profile/data-role' }
            };

            const runInstanceCommand = new RunInstancesCommand(instanceParams);
            const response = await ec2Client.send(runInstanceCommand);
            const instanceId = response.Instances[0].InstanceId;
            console.log("Instance ID:", instanceId);
        } catch (error) {
            console.error("Error starting EC2 instance:", error);
            return {
                statusCode: 500,
                body: "Error starting EC2 instance"
            };
        }
    }

    console.log("Completed process");

    return {
        statusCode: 200,
        body: "Successfully completed the output task"
    };
};
