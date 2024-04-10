import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3, aws_lambda as lambda, aws_dynamodb as dynamodb, aws_apigateway as apigateway} from 'aws-cdk-lib';
import { aws_iam as iam, aws_s3_notifications as s3_notifications,aws_lambda_event_sources as lambdaEventSources } from 'aws-cdk-lib';
import { aws_ec2 as ec2} from 'aws-cdk-lib';
import { aws_s3_deployment as s3deploy } from 'aws-cdk-lib';

export class InfraCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // storing the region in which the cdk is deployed
    const region=this.region;
    
    // creating the admin user
    const adminUser = new iam.User(this, 'AdminUser', {
      userName: 'admin'
    });

    // attaching administrator access policy to the user
    adminUser.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

     // create access key for the IAM user which will be used in react app
     const accessKey = new iam.CfnAccessKey(this, 'AdminUserAccessKey-${cdk.Names.uniqueId()}', {
      userName: adminUser.userName
    });

    // creating a role for ec2 execution which will be used during trigger lambda function
    const role = new iam.Role(this, 'MyEc2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      roleName: 'MyEc2Role', 
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess'), 
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore') ,
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess') 
      ]
    });

    // creating instance profile for which we will pass instance profile arn to ec2 instance which will be executed in trigger lambda function
    const instanceProfile = new iam.CfnInstanceProfile(this, 'MyInstanceProfile', {
      roles: [role.roleName]
    });

    // creating s3 bucket
    const bucket = new s3.Bucket(this, 'project_s3_bucket', {
      versioned: true
    });

    // enabling cors for the s3 bucket
    bucket.addCorsRule({
      allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.DELETE, s3.HttpMethods.POST],
      allowedOrigins: ['*'],
      allowedHeaders: ['*'],
    });

    // pushing the script file output.py which is in output_file into s3 bucket
    new s3deploy.BucketDeployment(this, 'DeployFile', {
      sources: [s3deploy.Source.asset('../output_file')],
      destinationBucket: bucket
    });
    
    //creating dynamo db table with id as primary key
    const table = new dynamodb.Table(this, 'dynamodb_table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE
    });

    // creating lambda function for inserting values into table, passing needed environment variables
    const lambdaFunction1 = new lambda.Function(this, 'insertdbfunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../insert_table'),
      environment: {
        TABLE_NAME: table.tableName,
        REGION_NAME:region
      }
    });

    // granting the lambda function necessary bucket and dynamo access rights
    table.grantReadWriteData(lambdaFunction1);
    bucket.grantReadWrite(lambdaFunction1);

    // creating a role for apigateway for accessing lambda function
    const apiGatewayRole = new iam.Role(this, 'ApiGatewayRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      roleName: 'MyApiGatewayRole'
    });

    apiGatewayRole.addToPolicy(new iam.PolicyStatement({
      actions: ['lambda:InvokeFunction'],
      resources: [lambdaFunction1.functionArn]
    }));

    // creating the api gateway using restapi, also enabled cors for api gateway
    const api = new apigateway.RestApi(this, 'MyApi',
    {
      restApiName: "MyApi",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS
      },
    }
    );
    
    // integrating lambda function with the api gateway
    const Integration = new apigateway.LambdaIntegration(lambdaFunction1);

    api.root.addMethod('POST', Integration);


    // creating new keypair for ec2
    const keyPair = new ec2.KeyPair(this, 'MyKeyPair', {
      keyPairName: 'my-data-key'
    });

    // creating new vpc for security group
    const vpc = new ec2.Vpc(this, 'MyVpc', {
      maxAzs: 2
    });

    // creating security group and passing the id to the ec2 instance
    const securityGroup = new ec2.SecurityGroup(this, 'MySecurityGroup', {
      vpc,  
      allowAllOutbound: true,
      securityGroupName: 'MySecurityGroup',
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH from anywhere');

    // creating lambda role for trigger function
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('IAMFullAccess'),
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ]
    });

    // attaching ec2 role to lamda role
    lambdaRole.addToPolicy(new iam.PolicyStatement({
      actions: ['iam:PassRole'],
      resources: [role.roleArn]
    }));

    // creating the lambda function with passing environment  variables and attaching lambda role
    const lambdaFunction2 = new lambda.Function(this, 'triggerfunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../dynamo_trigger'),
      environment: {
        TABLE_NAME: table.tableName,
        securityGroupId:securityGroup.securityGroupId,
        keyPair:keyPair.keyPairName,
        BUCKET_NAME:bucket.bucketName,
        ARN: instanceProfile.attrArn,
        REGION_NAME:region
      },
      role:lambdaRole
    });

    // Creating trigger for dynamo db by attaching lambda function
    lambdaFunction2.addEventSource(new lambdaEventSources.DynamoEventSource(table, {
      startingPosition: lambda.StartingPosition.LATEST
    }));

    // printing the created names of resources for using them in future
    new cdk.CfnOutput(this, 's3 bucket name', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'Dynamo db name', { value: table.tableName});
    new cdk.CfnOutput(this, 'api path', { value: api.url});
    new cdk.CfnOutput(this, 'region', { value: region });
    new cdk.CfnOutput(this, 'AdminUserAccessKey', { value: accessKey.ref });
    new cdk.CfnOutput(this, 'AdminUserSecretAccessKey', { value: accessKey.attrSecretAccessKey });
  }
}

