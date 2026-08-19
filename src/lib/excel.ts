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

export function parseExcelImportBuffer(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

  const parsedItems = rows.map((row, idx) => {
    const rawDate = row['Date'] || row['date'] || new Date().toISOString();
    const lineItem = String(row['Line Item'] || row['line item'] || row['Category'] || row['category'] || 'Expense');
    const remarks = String(row['Remarks'] || row['remarks'] || row['Description'] || '');
    const person = String(row['Person'] || row['person'] || '');
    const vehicle = String(row['Vehicle'] || row['vehicle'] || '');

    const investment = Number(row['Investment'] || row['investment'] || 0);
    const income = Number(row['Income'] || row['income'] || 0);
    const expense = Number(row['Expense'] || row['expense'] || row['Amount'] || row['amount'] || 0);

    let type: 'investment' | 'income' | 'expense' = 'expense';
    let amount = 0;

    if (investment > 0) {
      type = 'investment';
      amount = investment;
    } else if (income > 0) {
      type = 'income';
      amount = income;
    } else {
      type = 'expense';
      amount = expense;
    }

    return {
      rowId: idx + 1,
      transactionDate: rawDate,
      transactionType: type,
      lineItem,
      amount,
      remarks,
      person,
      vehicle,
      isValid: amount > 0,
      error: amount <= 0 ? 'Amount must be greater than 0' : null,
    };
  });

  return parsedItems;
}
