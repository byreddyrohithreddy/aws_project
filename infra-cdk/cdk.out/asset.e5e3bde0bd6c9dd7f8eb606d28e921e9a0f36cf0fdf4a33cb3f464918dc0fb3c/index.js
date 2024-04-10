const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const AWS_REGION = process.env.AWS_REGION;
const tableName = process.env.TABLE_NAME;

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

    return {
        statusCode: 200,
        body: "Item inserted successfully"
    };
};

