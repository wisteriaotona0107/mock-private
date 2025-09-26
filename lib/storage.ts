import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
  signatureVersion: 'v4'
});

const bucket = process.env.S3_BUCKET ?? '';
const publicBase = process.env.S3_PUBLIC_BASE_URL;

export interface StoredObject {
  key: string;
  url: string;
}

export async function putObject(buffer: Buffer, contentType: string, ttlHours: number): Promise<StoredObject> {
  const key = `uploads/${uuidv4()}`;
  await s3
    .putObject({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'private'
    })
    .promise();
  const url = publicBase ? `${publicBase}/${key}` : `s3://${bucket}/${key}`;
  return { key, url };
}

export async function getSignedUrl(key: string, expiresMinutes = 15) {
  return s3.getSignedUrlPromise('getObject', {
    Bucket: bucket,
    Key: key,
    Expires: expiresMinutes * 60
  });
}

export function extractKeyFromUrl(url: string): string {
  const publicBase = process.env.S3_PUBLIC_BASE_URL;
  if (publicBase && url.startsWith(publicBase)) {
    return url.slice(publicBase.length + 1);
  }
  if (url.startsWith('s3://')) {
    return url.split('/').slice(3).join('/');
  }
  const parts = url.split('/');
  return parts.slice(-2).join('/');
}
