const { DynamoDBClient, SendCommandCommand } = require("@aws-sdk/client-dynamodb");
const { EC2Client, RunInstancesCommand } = require("@aws-sdk/client-ec2");
const { encode } = require('base-64');

const bucket_name=process.env.BUCKET_NAME;
const table_name=process.env.TABLE_NAME;
const role_arn=process.env.ARN;
const Securityid=process.env.securityGroupId;
const keypair=process.env.KeyPair;
const AWS_REGION=process.env.REGION_NAME;

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
            aws s3 cp s3://${bucket_name}/output.py output.py
            python3 output.py ${id} ${bucket_name} ${table_name} ${AWS_REGION}`;

        const encodedUserData = encode(userData);

        console.log("Started executing script");

        try {
            const instanceParams = {
                ImageId: 'ami-05c969369880fa2c2',
                InstanceType: 't2.micro',
                MinCount: 1,
                MaxCount: 1,
                UserData: encodedUserData,
                SecurityGroupIds: [Securityid],
                KeyName: keypair,
                IamInstanceProfile: { Arn: role_arn }
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
