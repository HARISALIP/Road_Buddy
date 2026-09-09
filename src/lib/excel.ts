import * as XLSX from 'xlsx';

export interface ExcelRow {
  Date?: string | number | Date;
  'Line Item'?: string;
  'Opening Balance'?: number;
  Investment?: number;
  Income?: number;
  Expense?: number;
  'Closing Balance'?: number;
  Remarks?: string;
  Person?: string;
  Vehicle?: string;
  Invoice?: string;
}

export function exportTransactionsToExcel(transactions: Record<string, unknown>[]) {
  const data = transactions.map((t) => ({
    Date: t.transactionDate ? new Date(t.transactionDate as string).toISOString().split('T')[0] : '',
    Type: t.transactionType,
    Category: (t.categoryId as { name?: string })?.name || '',
    Amount: t.amount,
    Partner: (t.partnerId as { name?: string })?.name || '',
    Person: (t.personId as { name?: string })?.name || '',
    Vehicle: (t.vehicleId as { name?: string })?.name || '',
    Job: (t.jobId as { jobNumber?: string })?.jobNumber || '',
    Asset: (t.assetId as { name?: string })?.name || '',
    PaymentMethod: t.paymentMethod || 'Cash',
    InvoiceNumber: t.invoiceNumber || '',
    Remarks: t.remarks || '',
    Status: t.status || 'active',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
}

function parseAmount(val: unknown): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function parseExcelImportBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

  const parsedItems = rows.map((row, idx) => {
    // Helper to search row by case-insensitive key variants
    const getVal = (...keys: string[]): string => {
      for (const k of keys) {
        for (const rowKey of Object.keys(row)) {
          if (rowKey.trim().toLowerCase() === k.trim().toLowerCase()) {
            const val = row[rowKey];
            if (val !== undefined && val !== null) return String(val).trim();
          }
        }
      }
      return '';
    };

    const rawDate = getVal('Date', 'transactionDate', 'Date/Time') || new Date().toISOString();
    const rawType = getVal('Type', 'Transaction Type', 'transactionType', 'transaction_type').toLowerCase();
    const lineItem = getVal('Category', 'Line Item', 'line item', 'Item', 'Category Name') || 'General';
    const remarks = getVal('Remarks', 'Description', 'Notes', 'Memo');
    const partner = getVal('Partner', 'Partner Name', 'partner_name');
    const person = getVal('Person', 'Person Name', 'person_name');
    const vehicle = getVal('Vehicle', 'Vehicle Name', 'vehicle_name');
    const job = getVal('Job', 'Job Number', 'jobNumber');
    const asset = getVal('Asset', 'Asset Name', 'assetName');
    const invoiceNumber = getVal('InvoiceNumber', 'Invoice Number', 'Invoice', 'Bill');
    const paymentMethod = getVal('PaymentMethod', 'Payment Method', 'Payment') || 'Cash';

    const investmentAmt = parseAmount(getVal('Investment'));
    const incomeAmt = parseAmount(getVal('Income'));
    const expenseAmt = parseAmount(getVal('Expense'));
    const withdrawalAmt = parseAmount(getVal('Withdrawal'));
    const dividendAmt = parseAmount(getVal('Dividend'));
    const assetSaleAmt = parseAmount(getVal('Asset Sale', 'AssetSale'));
    const generalAmt = parseAmount(getVal('Amount'));

    let type: 'expense' | 'income' | 'investment' | 'withdrawal' | 'dividend' | 'asset_sale' = 'expense';
    let amount = 0;

    // 1. Explicit Type mapping
    if (['expense', 'income', 'investment', 'withdrawal', 'dividend', 'asset_sale'].includes(rawType)) {
      type = rawType as typeof type;
      amount = generalAmt || expenseAmt || incomeAmt || investmentAmt || withdrawalAmt || dividendAmt || assetSaleAmt;
    } else if (investmentAmt > 0) {
      type = 'investment';
      amount = investmentAmt;
    } else if (incomeAmt > 0) {
      type = 'income';
      amount = incomeAmt;
    } else if (withdrawalAmt > 0) {
      type = 'withdrawal';
      amount = withdrawalAmt;
    } else if (dividendAmt > 0) {
      type = 'dividend';
      amount = dividendAmt;
    } else if (assetSaleAmt > 0) {
      type = 'asset_sale';
      amount = assetSaleAmt;
    } else if (expenseAmt > 0) {
      type = 'expense';
      amount = expenseAmt;
    } else {
      amount = generalAmt;
      // Infer type from category/remarks if general amount was given
      const lowerCategory = lineItem.toLowerCase();
      const lowerRemarks = remarks.toLowerCase();
      if (
        lowerCategory.includes('income') ||
        lowerCategory.includes('rent') ||
        lowerRemarks.includes('job income') ||
        lowerRemarks.includes('job - income') ||
        lowerRemarks.includes('vehicle rent')
      ) {
        type = 'income';
      } else {
        type = 'expense';
      }
    }

    return {
      rowId: idx + 1,
      transactionDate: rawDate,
      transactionType: type,
      lineItem,
      amount,
      partner,
      person,
      vehicle,
      job,
      asset,
      invoiceNumber,
      paymentMethod,
      remarks,
      isValid: amount > 0,
      error: amount <= 0 ? 'Amount must be greater than 0' : null,
    };
  });

  return parsedItems;
}
