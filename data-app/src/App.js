
import {PutObjectCommand, S3Client} from "@aws-sdk/client-s3";
import { useState } from "react";
import { nanoid } from "nanoid";

function App() {

  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState('')

  const handleTextInputChange = (event) => {
      setInputText(event.target.value);
      };
    
const handleFileChange = (e) => {
  const file = e.target.files[0];
  setFile(file);
};

  const uploadFile = async () => {
    
    // This is where you need to set the value 
    const S3_BUCKET = "SET S3 BUCKET NAME HERE FROM THE CDK OUTPUT";

    // This is where you need to set the value 
    const REGION = "SET REGION FROM CDK OUTPUT";

    // This is where you need to set the value 
    const CREDENTIALS = {
        accessKeyId: "SET AdminUserAccesskey FROM THE CDK OUTPUT",
        secretAccessKey: "SET AdminUserSecretAccessKey FROM THE CDK OUTPUT"
    }
  
    const s3Client = new S3Client({
        region: REGION,
        credentials: CREDENTIALS
    });

      console.log(file)
      const command = new PutObjectCommand({
          Bucket: S3_BUCKET,
          Key: file.name,
          Body: file
      });

      try {
          const response = await s3Client.send(command);
          console.log(response);
          alert("File uploaded successfully.");
      } catch (err) {
          console.error(err);
          alert("Failed to upload file.");
      }

    // This is where you need to set the value 
    const API_PATH='SET THE API PATH NAME FROM THE CDK OUTPUT'

    const dynamoDbData = {
      id: nanoid(),
      input_text: inputText,
      input_file_path: `${S3_BUCKET}/${file.name}`,
    };

    const response = await fetch(API_PATH, {
      method: "POST",
      headers: {
        "Content-Type":"application/json",
      },
      body: JSON.stringify(dynamoDbData),
    });
    console.log(response)
    if (!response.ok) {
      throw new Error("Failed to save data to DynamoDB");
    }
    alert("File uploaded and data saved successfully!");
    
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-indigo-600 flex justify-center items-center">
    <div className="bg-white p-8 rounded shadow-lg w-full max-w-md">
    <form>
      <div className="mb-6">
        <label htmlFor="inputText" className="block text-gray-700">Text input:</label>
        <input
          type="text"
          id="inputText"
          placeholder="Enter text"
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 placeholder-gray-500"
          value={inputText}
          onChange={handleTextInputChange}
        />
      </div>
      <div className="mb-6">
        <label htmlFor="fileInput" className="block text-gray-700">File input:</label>
        <div className="relative mt-1 rounded-md shadow-sm">
        <input
          type="file"
          id="fileInput"
          accept=".txt"
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          onChange={handleFileChange}
        />
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={uploadFile}
        >
          Upload
        </button>
      </div>
    </form>
  </div>
</div>

  );
}

export default App;