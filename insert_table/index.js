const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { json } = require("stream/consumers");

const tableName = process.env.TABLE_NAME;
const AWS_REGION = process.env.REGION_NAME;

const dynamodbClient = new DynamoDBClient({ region:AWS_REGION});


exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    
    const requestBody = JSON.parse(event.body);
    try {
        const putItemParams = {
            TableName: tableName,
            Item: marshall(requestBody)
        };

        const putItemCommand = new PutItemCommand(putItemParams);
        await dynamodbClient.send(putItemCommand);

        console.log("Item inserted successfully");
    } catch (error) {
        console.error("Error inserting item:", error);
        return {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE',
            },
            statusCode: 500,
            body: JSON.stringify("ERROR")
        };
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE',
        },
        statusCode: 200,
        body: JSON.stringify("SUCCESSFUL")
    };
};