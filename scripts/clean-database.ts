import mongoose from 'mongoose';
import * as path from 'path';
import * as fs from 'fs';

// Manually parse .env.local if MONGODB_URI is not set in process.env
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
          if (key.trim() === 'MONGODB_URI') {
            mongoUri = val;
          }
        }
      }
    }
  }
}

if (!mongoUri) {
  console.error('Error: MONGODB_URI is not defined in process.env or .env.local');
  process.exit(1);
}

async function cleanDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri as string);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed.');
    }

    console.log('\n--- Cleaning Transactional & Activity Data ---');

    // 1. Transactions
    const transactionsResult = await db.collection('transactions').deleteMany({});
    console.log(`Deleted ${transactionsResult.deletedCount} items from 'transactions' collection.`);

    // 2. Jobs
    const jobsResult = await db.collection('jobs').deleteMany({});
    console.log(`Deleted ${jobsResult.deletedCount} items from 'jobs' collection.`);

    // 3. Assets
    const assetsResult = await db.collection('assets').deleteMany({});
    console.log(`Deleted ${assetsResult.deletedCount} items from 'assets' collection.`);

    // 4. Activity Logs
    const logsResult = await db.collection('activitylogs').deleteMany({});
    console.log(`Deleted ${logsResult.deletedCount} items from 'activitylogs' collection.`);

    console.log('\n--- Preserved collections ---');
    const usersCount = await db.collection('users').countDocuments();
    const partnersCount = await db.collection('partners').countDocuments();
    const categoriesCount = await db.collection('categories').countDocuments();
    const vehiclesCount = await db.collection('vehicles').countDocuments();
    const peopleCount = await db.collection('people').countDocuments();

    console.log(`Users preserved: ${usersCount}`);
    console.log(`Partners preserved: ${partnersCount}`);
    console.log(`Categories preserved: ${categoriesCount}`);
    console.log(`Vehicles preserved: ${vehiclesCount}`);
    console.log(`People preserved: ${peopleCount}`);

    console.log('\nDatabase cleanup completed successfully!');
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

cleanDatabase();
