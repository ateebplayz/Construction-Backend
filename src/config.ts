import * as dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL || '';
const jwtKey = process.env.JWT_KEY || '';
const adminLevel = 1;
const employeeLevel = 0;
const r2AccessKey = process.env.R2_ACCESS_KEY || '';
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const r2Url = process.env.R2_URL || '';
const r2PublicUrl = process.env.R2_PUBLIC_URL || '';
const r2BucketName = process.env.R2_BUCKET_NAME || '';

export {
  mongoUrl,
  jwtKey,
  adminLevel,
  employeeLevel,
  r2AccessKey,
  r2SecretAccessKey,
  r2Url,
  r2PublicUrl,
  r2BucketName,
};
