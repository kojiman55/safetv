import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fetchDisasterAlert } from './shared/disaster'

const s3 = new S3Client({ region: 'ap-northeast-1' })
const BUCKET = process.env.BUCKET_NAME!

export const handler = async () => {
  const alert = await fetchDisasterAlert()
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'alerts/latest-osaka.json',
    Body: JSON.stringify(alert),
    ContentType: 'application/json',
  }))
  console.log('alert saved:', JSON.stringify(alert))
}
