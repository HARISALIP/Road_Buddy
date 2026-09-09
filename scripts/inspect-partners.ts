import mongoose from 'mongoose';
import * as path from 'path';
import * as fs from 'fs';

let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const envContent = fs.readFileSync(envLocalPath, 'utf8');
    for (const line of envContent.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (key.trim() === 'MONGODB_URI') mongoUri = val;
        }
      }
    }
  }
}

async function inspectPartners() {
  await mongoose.connect(mongoUri as string);
  const db = mongoose.connection.db;
  if (!db) return;

  const partners = await db.collection('partners').find({}).toArray();
  console.log('--- ALL PARTNERS ---');
  console.log(JSON.stringify(partners, null, 2));

  for (const p of partners) {
    const txCount = await db.collection('transactions').countDocuments({ partnerId: p._id });
    console.log(`Partner "${p.name}" (_id: ${p._id}) has ${txCount} transactions.`);
  }

  await mongoose.disconnect();
}

inspectPartners();
