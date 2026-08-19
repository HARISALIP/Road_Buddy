import { ITransaction } from '@/models/Transaction';

export interface DashboardMetrics {
  currentBalance: number;
  totalInvestment: number;
  totalIncome: number;
  totalExpenses: number;
  totalWithdrawals: number;
  totalDividends: number;
  totalAssetSales: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNetChange: number;
  operatingProfit: number;
}

export interface PartnerSummaryItem {
  partnerId: string;
  name: string;
  profitSharePercentage: number;
  investment: number;
  withdrawal: number;
  dividend: number;
  profitShare: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculateDashboardMetrics(transactions: any[]): DashboardMetrics {
  const activeTx = transactions.filter((t) => t.status !== 'void');

  let totalInvestment = 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalWithdrawals = 0;
  let totalDividends = 0;
  let totalAssetSales = 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let monthlyIncome = 0;
  let monthlyExpenses = 0;

  for (const t of activeTx) {
    const amount = Number(t.amount) || 0;
    const tDate = t.transactionDate ? new Date(t.transactionDate) : new Date();
    const isThisMonth = tDate >= startOfMonth;

    switch (t.transactionType) {
      case 'income':
        totalIncome += amount;
        if (isThisMonth) monthlyIncome += amount;
        break;
      case 'expense':
        totalExpenses += amount;
        if (isThisMonth) monthlyExpenses += amount;
        break;
      case 'investment':
        totalInvestment += amount;
        break;
      case 'withdrawal':
        totalWithdrawals += amount;
        break;
      case 'dividend':
        totalDividends += amount;
        break;
      case 'asset_sale':
        totalAssetSales += amount;
        break;
    }
  }

  const currentBalance =
    totalInvestment + totalIncome + totalAssetSales - (totalExpenses + totalWithdrawals + totalDividends);

  const operatingProfit = totalIncome - totalExpenses;
  const monthlyNetChange = monthlyIncome - monthlyExpenses;

  return {
    currentBalance,
    totalInvestment,
    totalIncome,
    totalExpenses,
    totalWithdrawals,
    totalDividends,
    totalAssetSales,
    monthlyIncome,
    monthlyExpenses,
    monthlyNetChange,
    operatingProfit,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calculatePartnerSummary(
  partners: Array<{ _id: string; name: string; profitSharePercentage: number }>,
  transactions: any[]
): PartnerSummaryItem[] {
  const activeTx = transactions.filter((t) => t.status !== 'void');

  const metrics: DashboardMetrics = calculateDashboardMetrics(activeTx);
  const operatingProfit = Math.max(0, metrics.operatingProfit);

  return partners.map((p) => {
    const pIdStr = p._id.toString();

    let investment = 0;
    let withdrawal = 0;
    let dividend = 0;

    for (const t of activeTx) {
      const amount = Number(t.amount) || 0;
      const tPartnerId = t.partnerId ? t.partnerId.toString() : '';

      if (tPartnerId === pIdStr) {
        if (t.transactionType === 'investment') investment += amount;
        if (t.transactionType === 'withdrawal') withdrawal += amount;
        if (t.transactionType === 'dividend') dividend += amount;
      }
    }

    const profitShare = (operatingProfit * (p.profitSharePercentage || 0)) / 100;

    return {
      partnerId: pIdStr,
      name: p.name,
      profitSharePercentage: p.profitSharePercentage,
      investment,
      withdrawal,
      dividend,
      profitShare,
    };
  });
}
