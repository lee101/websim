import os
import boto3
from botocore.client import Config

R2_ACCESS_KEY_ID = os.getenv('R2_ACCESS_KEY_ID', 'test')
R2_SECRET_ACCESS_KEY = os.getenv('R2_SECRET_ACCESS_KEY', 'test')
R2_BUCKET_NAME = os.getenv('R2_BUCKET_NAME', 'test-bucket')
R2_ENDPOINT_URL = os.getenv('R2_ENDPOINT_URL', 'https://example.com')

_session = None
_client = None

def get_s3_client():
    global _client
    if _client is None:
        _client = boto3.client(
            's3',
            endpoint_url=R2_ENDPOINT_URL,
            aws_access_key_id=R2_ACCESS_KEY_ID,
            aws_secret_access_key=R2_SECRET_ACCESS_KEY,
            config=Config(signature_version='s3v4'),
        )
    return _client

def generate_presigned_upload_url(user_id: str, filename: str, expiration: int = 3600) -> str:
    key = f"uploads/{user_id}/{filename}"
    client = get_s3_client()
    return client.generate_presigned_url(
        'put_object',
        Params={'Bucket': R2_BUCKET_NAME, 'Key': key},
        ExpiresIn=expiration,
    )

def list_user_objects(user_id: str):
    prefix = f"uploads/{user_id}/"
    client = get_s3_client()
    resp = client.list_objects_v2(Bucket=R2_BUCKET_NAME, Prefix=prefix)
    contents = resp.get('Contents', [])
    files = []
    for obj in contents:
        key = obj['Key']
        if key.endswith('/'):
            continue
        files.append({'key': key, 'size': obj.get('Size'), 'last_modified': obj.get('LastModified')})
    return files

def delete_user_object(user_id: str, filename: str):
    key = f"uploads/{user_id}/{filename}"
    client = get_s3_client()
    client.delete_object(Bucket=R2_BUCKET_NAME, Key=key)

def rename_user_object(user_id: str, old_name: str, new_name: str):
    client = get_s3_client()
    old_key = f"uploads/{user_id}/{old_name}"
    new_key = f"uploads/{user_id}/{new_name}"
    client.copy_object(Bucket=R2_BUCKET_NAME, CopySource={"Bucket": R2_BUCKET_NAME, "Key": old_key}, Key=new_key)
    client.delete_object(Bucket=R2_BUCKET_NAME, Key=old_key)
