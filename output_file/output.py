import boto3
import sys

def process_file(file_id,bucket_name,table_name,region):
    # Retrieve input file from S3
    dynamodb = boto3.resource('dynamodb',region_name=region)
    s3 = boto3.client('s3')

    table = dynamodb.Table(table_name)
    try:
        response = table.get_item(
            Key={'id': file_id}
        )
        item = response.get('Item')

    except Exception as e:
        print(f"Error retrieving item from DynamoDB: {e}")
        return None
    
    input_text=item['input_text']
    items=item['input_file_path'].split('/')
    input_file_path=items[1]
    output_file_path=input_file_path.split('.')[0]+"-"+file_id+".txt"
    
    try:
        response = s3.get_object(Bucket=bucket_name, Key=input_file_path)
        input_file_content = response['Body'].read().decode('utf-8')
    except Exception as e:
        print(f"Error retrieving input file from S3: {e}")
        return
    
    output_content = f"{input_file_content} {input_text}"
    
    try:
        s3.put_object(Bucket=bucket_name, Key=output_file_path, Body=output_content)
    except Exception as e:
        print(f"Error uploading output file to S3: {e}")
        return
    
    table = dynamodb.Table(table_name)
    try:
        full_output__path=bucket_name+"/"+output_file_path
        table.update_item(
            Key={'id': file_id},
            UpdateExpression='SET output_file_path = :val1',
            ExpressionAttributeValues={':val1': full_output__path}
        )
    except Exception as e:
        print(f"Error updating DynamoDB record: {e}")
        return
    
    print("Processing completed successfully.")

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python script.py <file_id> <input_text> <input_file_path> <output_file_path>")
        sys.exit(1)
    
    file_id = sys.argv[1]
    bucket_name=sys.argv[2]
    table_name=sys.argv[3]
    region=sys.argv[4]
    
    process_file(file_id,bucket_name,table_name,region)
