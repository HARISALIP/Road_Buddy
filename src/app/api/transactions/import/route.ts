import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Category from '@/models/Category';
import Person from '@/models/Person';
import Vehicle from '@/models/Vehicle';
import { parseExcelImportBuffer } from '@/lib/excel';

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const parsedItems = parseExcelImportBuffer(buffer);
      return NextResponse.json({ success: true, preview: parsedItems });
    } else {
      // Batch confirm import
      const body = await req.json();
      const { items } = body;

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'No valid items to import' }, { status: 400 });
      }

      let importedCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      for (const item of items) {
        try {
          if (!item.isValid || !item.amount || item.amount <= 0) {
            failedCount++;
            errors.push(`Row ${item.rowId}: Invalid amount`);
            continue;
          }

          // Category mapping/creation
          let categoryId = undefined;
          if (item.lineItem && (item.transactionType === 'expense' || item.transactionType === 'income')) {
            const cat = await Category.findOneAndUpdate(
              { name: item.lineItem, type: item.transactionType },
              { name: item.lineItem, type: item.transactionType, status: 'active' },
              { upsert: true, new: true }
            );
            categoryId = cat._id;
          }

          // Person mapping/creation
          let personId = undefined;
          if (item.person) {
            const p = await Person.findOneAndUpdate(
              { name: item.person },
              { name: item.person, status: 'active' },
              { upsert: true, new: true }
            );
            personId = p._id;
          }

          // Vehicle mapping/creation
          let vehicleId = undefined;
          if (item.vehicle) {
            const v = await Vehicle.findOneAndUpdate(
              { name: item.vehicle },
              { name: item.vehicle, status: 'active' },
              { upsert: true, new: true }
            );
            vehicleId = v._id;
          }

          await Transaction.create({
            transactionDate: item.transactionDate ? new Date(item.transactionDate) : new Date(),
            transactionType: item.transactionType,
            amount: item.amount,
            categoryId,
            personId,
            vehicleId,
            remarks: item.remarks || '',
            paymentMethod: 'Cash',
            status: 'active',
          });

          importedCount++;
        } catch (err: unknown) {
          failedCount++;
          errors.push(`Row ${item.rowId}: ${(err as Error).message}`);
        }
      }

      return NextResponse.json({
        success: true,
        importedCount,
        failedCount,
        errors,
      });
    }
  } catch (error: unknown) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to process Excel import' }, { status: 500 });
  }
}
