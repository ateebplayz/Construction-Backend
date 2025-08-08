import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { r2Url, r2AccessKey, r2SecretAccessKey, r2BucketName } from '../config';

@Injectable()
export class R2Service {
  private s3: S3Client;
  private bucket = r2BucketName;

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: r2Url,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretAccessKey,
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `${uuid()}-${file.originalname}`;
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return key;
  }
}
