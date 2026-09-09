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

async function fixupData() {
  try {
    console.log('Connecting to MongoDB for data fixup...');
    await mongoose.connect(mongoUri as string);
    const db = mongoose.connection.db;
    if (!db) throw new Error('DB connection failed');

    // 1. Ensure core vehicles exist
    const suzuki = await db.collection('vehicles').findOneAndUpdate(
      { name: new RegExp('^Suzuki$', 'i') },
      { $setOnInsert: { name: 'Suzuki', registrationNumber: 'KSA-1029', status: 'active', createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    const daihatsu = await db.collection('vehicles').findOneAndUpdate(
      { name: new RegExp('^Daihatsu$', 'i') },
      { $setOnInsert: { name: 'Daihatsu', registrationNumber: 'KSA-8832', status: 'active', createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    const suzukiId = suzuki?._id;
    const daihatsuId = daihatsu?._id;

    // 2. Ensure core partners exist
    const fasil = await db.collection('partners').findOneAndUpdate(
      { name: new RegExp('^Fasil', 'i') },
      { $setOnInsert: { name: 'FASIL', profitSharePercentage: 50, status: 'active', createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );
    const irshad = await db.collection('partners').findOneAndUpdate(
      { name: new RegExp('^Irshad', 'i') },
      { $setOnInsert: { name: 'IRSHAD', profitSharePercentage: 50, status: 'active', createdAt: new Date() } },
      { upsert: true, returnDocument: 'after' }
    );

    const fasilId = fasil?._id;
    const irshadId = irshad?._id;

    // 3. Ensure core categories have correct types
    const incomeCatNames = ['General Income', 'Job Income', 'Vehicle Rent', 'Other Income'];
    for (const catName of incomeCatNames) {
      await db.collection('categories').updateMany(
        { name: catName },
        { $set: { type: 'income', status: 'active' } }
      );
    }

    // 4. Fetch all categories into a lookup map
    const categories = await db.collection('categories').find({}).toArray();
    const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

    // 5. Fetch all transactions and fix classification & relations
    const transactions = await db.collection('transactions').find({}).toArray();
    let updatedCount = 0;

    for (const t of transactions) {
      const updates: Record<string, unknown> = {};
      const cat = t.categoryId ? categoryMap.get(t.categoryId.toString()) : null;
      const remarks = String(t.remarks || '').toLowerCase();
      const catName = cat ? String(cat.name).toLowerCase() : '';

      // Check if this should be 'income'
      if (
        catName === 'general income' ||
        catName === 'job income' ||
        catName === 'vehicle rent' ||
        catName === 'other income' ||
        remarks.includes('job income') ||
        remarks.includes('job - income') ||
        remarks.includes('rent')
      ) {
        if (t.transactionType !== 'income') {
          updates.transactionType = 'income';
        }
      }

      // Check vehicle relation
      if (!t.vehicleId) {
        if (remarks.includes('suzuki')) {
          updates.vehicleId = suzukiId;
        } else if (remarks.includes('daihatsu')) {
          updates.vehicleId = daihatsuId;
        }
      }

      // Check partner relation
      if (!t.partnerId) {
        if (remarks.includes('fasil')) {
          updates.partnerId = fasilId;
        } else if (remarks.includes('irshad')) {
          updates.partnerId = irshadId;
        }
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('transactions').updateOne({ _id: t._id }, { $set: updates });
        updatedCount++;
      }
    }

    console.log(`Successfully fixed up ${updatedCount} transactions out of ${transactions.length} total.`);
  } catch (err) {
    console.error('Data fixup error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

fixupData();
