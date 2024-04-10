# aws_project

Welcome to the project, I have created the React Js app with aws cloud integration

Lets divide the project into two steps
1. Creating the aws infrastructure set-up using aws cdk
2. Creating the react app and setting up the values.

<b>1.creating the aws infrastructure using aws cdk:</b>

- Hope you know how to setup the cdk on your local system for that you can refer to the below link and setup the cdk on your system
https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html#getting_started_install

- After setting up the cdk, download the above project using
  ``` git clone https://github.com/byreddyrohithreddy/aws_project ```
![Screenshot (98)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/fd591bab-c3e5-43fe-9c35-a16b039c1882)

- now go inside the infra-cdk directory and open command line and enter ``` cdk deploy ```
- cdk is configured will all services including creating lambda functions, api gateway, s3 buckets, creating dynamodb table, triggers, creating roles and access, dynamically adjusting all services, uploading script to the s3 etc.,
- I have wrote lambda functions using aws sdk javascript v3 and the script which is executed in ec2 instance is a python script.
- I have given necessary role access to the services, also enabled cors for s3 and api gateway as they are accessed directly from the local system.
- EC2 instance will be automatically created and destroyed to save computing resources.
- Above code will successfully deploy everything on your system
![Screenshot (99)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/9ae9a865-dec8-4bfa-a553-1ceceb75651e)

- Now you can see some outputs on the screen we need some of them for the React APP to connect to the aws system, if we deploy react app on s3 we don't need those variables to manually keep

<b>2. Creating the react app and setting up the values:</b>
- From step 1 we received few deployed services names and paths, we will use them in react App to use them
- Go to the folder data-app this folder is react project, to run the react app we need to have node package which need to be downloaded before.
- Download node from here:   https://nodejs.org/en/download
- 

 
