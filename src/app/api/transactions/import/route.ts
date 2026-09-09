import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Category from '@/models/Category';
import Partner from '@/models/Partner';
import Person from '@/models/Person';
import Vehicle from '@/models/Vehicle';
import Job from '@/models/Job';
import Asset from '@/models/Asset';
import { parseExcelImportBuffer } from '@/lib/excel';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      const { items, importMode = 'append' } = body;

      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ error: 'No valid items to import' }, { status: 400 });
      }

      // If Replace/Restore mode is selected, clear existing transactions first
      if (importMode === 'replace') {
        await Transaction.deleteMany({});
        await logActivity(
          'DELETE',
          'Transaction',
          'Cleared all existing transactions for full Excel restore/import'
        );
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
              { name: item.lineItem },
              { name: item.lineItem, type: item.transactionType, status: 'active' },
              { upsert: true, new: true }
            );
            categoryId = cat._id;
          }

          // Partner mapping/creation
          let partnerId = undefined;
          if (item.partner) {
            const p = await Partner.findOneAndUpdate(
              { name: new RegExp(`^${item.partner.trim()}$`, 'i') },
              { name: item.partner.trim().toUpperCase(), status: 'active' },
              { upsert: true, new: true }
            );
            partnerId = p._id;
          }

          // Person mapping/creation
          let personId = undefined;
          if (item.person) {
            const p = await Person.findOneAndUpdate(
              { name: new RegExp(`^${item.person.trim()}$`, 'i') },
              { name: item.person.trim(), status: 'active' },
              { upsert: true, new: true }
            );
            personId = p._id;
          }

          // Vehicle mapping/creation
          let vehicleId = undefined;
          if (item.vehicle) {
            const v = await Vehicle.findOneAndUpdate(
              { name: new RegExp(`^${item.vehicle.trim()}$`, 'i') },
              { name: item.vehicle.trim(), status: 'active' },
              { upsert: true, new: true }
            );
            vehicleId = v._id;
          }

          // Job mapping/creation
          let jobId = undefined;
          if (item.job) {
            const j = await Job.findOneAndUpdate(
              { jobNumber: item.job.trim() },
              { jobNumber: item.job.trim(), customerName: item.job.trim(), status: 'completed' },
              { upsert: true, new: true }
            );
            jobId = j._id;
          }

          // Asset mapping/creation
          let assetId = undefined;
          if (item.asset) {
            const a = await Asset.findOneAndUpdate(
              { name: item.asset.trim() },
              { name: item.asset.trim(), assetType: 'General', purchaseAmount: item.amount, status: 'active' },
              { upsert: true, new: true }
            );
            assetId = a._id;
          }

          await Transaction.create({
            transactionDate: item.transactionDate ? new Date(item.transactionDate) : new Date(),
            transactionType: item.transactionType,
            amount: item.amount,
            categoryId,
            partnerId,
            personId,
            vehicleId,
            jobId,
            assetId,
            invoiceNumber: item.invoiceNumber || '',
            paymentMethod: item.paymentMethod || 'Cash',
            remarks: item.remarks || '',
            status: 'active',
          });

          importedCount++;
        } catch (err: unknown) {
          failedCount++;
          errors.push(`Row ${item.rowId}: ${(err as Error).message}`);
        }
      }

      await logActivity(
        'CREATE',
        'Transaction',
        `Excel import completed (${importMode} mode): ${importedCount} imported, ${failedCount} failed`
      );

      return NextResponse.json({
        success: true,
        importMode,
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
