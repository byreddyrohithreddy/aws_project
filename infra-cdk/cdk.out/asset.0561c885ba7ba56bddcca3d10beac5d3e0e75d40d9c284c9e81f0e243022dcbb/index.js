const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const tableName = process.env.TABLE_NAME;
const AWS_REGION = process.env.REGION_NAME;

const dynamodbClient = new DynamoDBClient({ region:AWS_REGION});

exports.handler = async (event) => {
    console.log(JSON.stringify(event));

    try {
        const putItemParams = {
            TableName: tableName,
            Item: marshall(event)
        };

        const putItemCommand = new PutItemCommand(putItemParams);
        await dynamodbClient.send(putItemCommand);

        console.log("Item inserted successfully");
    } catch (error) {
        console.error("Error inserting item:", error);
        return {
            statusCode: 500,
            body: "Error inserting item"
        };
    }
    const metaData = {
        headers: {
          "Access-Control-Allow-Methods": "'GET,POST,OPTIONS'",
          "Access-Control-Allow-Origin": "'*'",
          "Access-Control-Allow-Headers": "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"
        },
    };
    return {
        ...metaData,
        statusCode: 200,
        body: "Item inserted successfully"
    };
};

