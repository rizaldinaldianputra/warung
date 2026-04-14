import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const bucketName = process.env.MINIO_BUCKET || 'warung-products';

// Helper to ensure bucket exists
export async function ensureBucket() {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName);
    
    // Set public policy for the bucket so images can be viewed
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
  }
}

export async function uploadFile(file: Buffer, fileName: string, mimeType: string) {
  await ensureBucket();
  
  const objectName = `${Date.now()}-${fileName}`;
  await minioClient.putObject(bucketName, objectName, file, file.length, {
    'Content-Type': mimeType,
  });
  
  const publicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL || `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}`;
  return `${publicUrl}/${bucketName}/${objectName}`;
}

export { minioClient };
