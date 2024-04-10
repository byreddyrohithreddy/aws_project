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
  
![Screenshot (100)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/8f4248cd-3ba3-4858-85ba-f4a4b5ab6c5f)

- Now you can see some outputs on the screen we need some of them for the React APP to connect to the aws system, if we deploy react app on s3 we don't need those variables to manually keep

<b>2. Creating the react app and setting up the values:</b>
- From step 1 we received few deployed services names and paths, we will use them in react App to use them
- Go to the folder data-app this folder is react project, to run the react app we need to have node package which need to be downloaded before.
- Download node from here:   https://nodejs.org/en/download
- I have used tailwind css for my project and I have downloaded everything in the project.
- Now open the file specified ```src/App.js```
- Open the App.js and we need to set few values to get it executed, See the below photo and set the values on cdk output to the variables mentioned respectively
- The s3 bucket name, accesskey, secretkey and api path are the values needed for the react app to run smoothly, set by seeing the below screens
  
![Screenshot (101)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/695a7cb8-68db-4622-aa26-60e4ed098107)

![Screenshot (102)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/543d5d44-b80f-43f7-91b5-c45537aacc74) 

- After setting the values successfully , now go to data-app folder and execute the below command to run the app
  ``` npm start ```
- After running you will get the screen like below
  
  ![Screenshot (103)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/67ac9c6e-92fd-4008-adf4-ca4026325cbb)

- on this screen you can input text and also can input the text file, after giving the inputs you can see below screen
  
  ![Screenshot (104)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/d1005f90-611e-480b-a574-5d2889c3ca6b)
  
- I have given input as " I am here"  and the tt.txt contains as per below image
  
![Screenshot (105)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/aad03f58-dcf6-4146-91a4-d45225747b95)

- When I click on upload , I get two alerts saying "file uploaded successfully" and "data saved"  which can be seen in  below images
  
  ![Screenshot (106)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/164bfa21-ad8d-415c-be45-1c26d222b18b)
  ![Screenshot (107)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/8d45b96b-894a-40e3-8222-47ed0c5fbda3)

- Now Lets see our s3 bucket
  
  ![Screenshot (108)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/f608688b-f407-43f6-9c9c-4affd6ef288d)

- We can see two files one is input tt.txt and other tt-{uniqueid}.txt , this unique id is created while uploading the data into dynamo db
- Now lets see dynamo db
  
  ![Screenshot (109)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/259b2197-6eb6-4ebf-a3ff-f762a45391d6)
  
- Both input_file_path and output_file_path are populated
  
  ![image](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/a12734df-5b71-421e-ad5a-4dec105acd05)

- You can see the ec2 instance is created and terminated automatically
- Lets see the output file bucket for verifying whether the input text is appended
  
 ![Screenshot (111)](https://github.com/byreddyrohithreddy/aws_project/assets/34168749/0b1560ea-48e8-4e4a-a80d-1f638d4f0f10)

- You can see the input text is appended successfully
- End of the project

Resources:
- https://docs.aws.amazon.com/
- https://tailwindcss.com/docs/guides/create-react-app
- https://repost.aws/questions/QUFSjaWoPrQU-BnOm-fWAjwA/cors-with-api-gateway-http
- https://docs.aws.amazon.com/cdk/v2/guide/hello_world.html#hello_world_tutorial_create_app

For any doubts:
- email: rbyreddy@asu.edu
- phone no: 6028493301

   


 
  

 
