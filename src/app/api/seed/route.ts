import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Partner from '@/models/Partner';
import Category from '@/models/Category';
import Person from '@/models/Person';
import Vehicle from '@/models/Vehicle';
import Asset from '@/models/Asset';
import Job from '@/models/Job';
import Transaction from '@/models/Transaction';
import { hashPassword } from '@/lib/auth';

export async function POST() {
  try {
    await connectToDatabase();

    // 1. Admin User
    let admin = await User.findOne({ email: 'admin@roadbuddy.com' });
    if (!admin) {
      const hashedPassword = await hashPassword('admin123');
      admin = await User.create({
        name: 'Road Buddy Admin',
        email: 'admin@roadbuddy.com',
        password: hashedPassword,
        role: 'admin',
      });
    }

    // 2. Partners & Users (Owners)
    const partnerA = await Partner.findOneAndUpdate(
      { name: 'FASIL' },
      { name: 'FASIL', profitSharePercentage: 50, status: 'active' },
      { upsert: true, new: true }
    );

    const partnerB = await Partner.findOneAndUpdate(
      { name: 'IRSHAD' },
      { name: 'IRSHAD', profitSharePercentage: 50, status: 'active' },
      { upsert: true, new: true }
    );

    // Create User accounts for Owners
    let fasilUser = await User.findOne({ email: 'fasil@roadbuddy.com' });
    if (!fasilUser) {
      const p = await hashPassword('Pachu@2233');
      await User.create({ name: 'FASIL', email: 'fasil@roadbuddy.com', password: p, role: 'admin' });
    }

    let irshadUser = await User.findOne({ email: 'irshad@roadbuddy.com' });
    if (!irshadUser) {
      const p = await hashPassword('Irshad@81');
      await User.create({ name: 'IRSHAD', email: 'irshad@roadbuddy.com', password: p, role: 'admin' });
    }

    // 3. Vehicles
    const suzuki = await Vehicle.findOneAndUpdate(
      { name: 'Suzuki' },
      { name: 'Suzuki', registrationNumber: 'KSA-1029', status: 'active' },
      { upsert: true, new: true }
    );

    const daihatsu = await Vehicle.findOneAndUpdate(
      { name: 'Daihatsu' },
      { name: 'Daihatsu', registrationNumber: 'KSA-8832', status: 'active' },
      { upsert: true, new: true }
    );

    // 4. People
    const peopleNames = ['Sahad', 'Shibin', 'Suhail'];
    const peopleDocs: Record<string, unknown>[] = [];
    for (const pName of peopleNames) {
      const p = await Person.findOneAndUpdate(
        { name: pName },
        { name: pName, status: 'active' },
        { upsert: true, new: true }
      );
      peopleDocs.push(p);
    }

    // 5. Expense Categories
    const expenseCategories = [
      'Food',
      'Housing',
      'Fuel',
      'Transportation & Logistics',
      'Driving License',
      'Uniform & PPE',
      'Iqama & ID',
      'Telecom',
      'Marketing',
      'Tools',
      'Salary',
      'Asset Purchase',
      'Asset Maintenance',
      'Maintenance',
      'Vehicle Levy',
      'Job Expense',
      'Charity',
      'Other',
    ];

    const categoryMap: Record<string, unknown> = {};
    for (const name of expenseCategories) {
      const cat = await Category.findOneAndUpdate(
        { name, type: 'expense' },
        { name, type: 'expense', status: 'active' },
        { upsert: true, new: true }
      );
      categoryMap[`expense_${name}`] = cat;
    }

    // 6. Income Categories
    const incomeCategories = ['Job Income', 'Vehicle Rent', 'Other Income'];
    for (const name of incomeCategories) {
      const cat = await Category.findOneAndUpdate(
        { name, type: 'income' },
        { name, type: 'income', status: 'active' },
        { upsert: true, new: true }
      );
      categoryMap[`income_${name}`] = cat;
    }

    // 7. Assets
    const honorTablet = await Asset.findOneAndUpdate(
      { name: 'Honor Tablet' },
      { name: 'Honor Tablet', assetType: 'Electronics', purchaseAmount: 600, status: 'sold', saleAmount: 519, saleDate: new Date() },
      { upsert: true, new: true }
    );

    // 8. Sample Job
    const sampleJob = await Job.findOneAndUpdate(
      { jobNumber: 'JOB-2026-001' },
      { jobNumber: 'JOB-2026-001', customerName: 'Saudi Aramco Logistics', description: 'Equipment Transport', status: 'completed' },
      { upsert: true, new: true }
    );

    // 9. Sample Transactions (only seed if zero exist)
    const existingCount = await Transaction.countDocuments();
    if (existingCount === 0) {
      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const prevWeek = new Date(Date.now() - 7 * 86400000);

      await Transaction.create([
        {
          transactionDate: prevWeek,
          transactionType: 'investment',
          amount: 13280,
          partnerId: partnerA._id,
          paymentMethod: 'Bank',
          remarks: 'Initial Partner A investment',
          createdBy: admin._id,
        },
        {
          transactionDate: yesterday,
          transactionType: 'expense',
          amount: 50,
          categoryId: (categoryMap['expense_Fuel'] as { _id: string })?._id,
          vehicleId: daihatsu._id,
          paymentMethod: 'Cash',
          remarks: 'Dammam - Daihatsu fuel',
          createdBy: admin._id,
        },
        {
          transactionDate: yesterday,
          transactionType: 'income',
          amount: 375,
          categoryId: (categoryMap['income_Job Income'] as { _id: string })?._id,
          jobId: sampleJob._id,
          customerName: 'Saudi Aramco Logistics',
          paymentMethod: 'Bank',
          remarks: 'Logistics delivery payment',
          createdBy: admin._id,
        },
        {
          transactionDate: today,
          transactionType: 'investment',
          amount: 2000,
          partnerId: partnerB._id,
          paymentMethod: 'Bank',
          remarks: 'Partner B capital contribution',
          createdBy: admin._id,
        },
        {
          transactionDate: today,
          transactionType: 'asset_sale',
          amount: 519,
          assetId: honorTablet._id,
          paymentMethod: 'Cash',
          remarks: 'Honor Tablet sale',
          createdBy: admin._id,
        },
        {
          transactionDate: today,
          transactionType: 'dividend',
          amount: 519,
          partnerId: partnerA._id,
          profitPeriod: 'Q2 2026',
          paymentMethod: 'Bank',
          remarks: 'Partner A Q2 dividend payout',
          createdBy: admin._id,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with default categories, partners, vehicles, people, and sample data.',
    });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
