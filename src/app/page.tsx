import DashboardClient from '@/components/DashboardClient';
import { getTransactions } from '@/actions/transactionActions';

const BUDGET = 200000;

export const revalidate = 0; // 常に最新データを取得する

export default async function Home() {
  const transactions = await getTransactions();
  
  const initialExpenses = {
    living: 0,
    investment: 0,
    luxury: 0,
  };

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  for (const t of transactions) {
    if (!t.date) continue;
    
    // スプレッドシートの日付フォーマット（YYYY-MM-DD または YYYY/MM/DD）に対応
    const parts = t.date.split(/[-/]/);
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      
      // 今月のデータのみ合算する
      if (year === currentYear && month === currentMonth) {
        if (t.category === '生活費') initialExpenses.living += t.amount;
        else if (t.category === '投資') initialExpenses.investment += t.amount;
        else if (t.category === '贅沢費') initialExpenses.luxury += t.amount;
        else {
          // 未分類や空白のものはとりあえず生活費に加算
          initialExpenses.living += t.amount; 
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/50">
      <div className="max-w-md mx-auto min-h-screen flex flex-col relative pb-12">
        {/* Decorative Background Blur */}
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-blue-100/50 via-emerald-50/30 to-transparent dark:from-blue-900/20 dark:via-emerald-900/10 -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-200/40 dark:bg-emerald-800/20 rounded-full blur-[80px] -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute top-20 left-0 w-[250px] h-[250px] bg-blue-200/40 dark:bg-blue-800/20 rounded-full blur-[80px] -z-10 pointer-events-none -translate-x-1/3" />

        <DashboardClient budget={BUDGET} initialExpenses={initialExpenses} />
      </div>
    </main>
  );
}
