'use client';

import { useState, useEffect } from 'react';
import ProgressChart from '@/components/ProgressChart';
import ExpenseForm, { Category } from '@/components/ExpenseForm';
import { addTransaction, deleteTransaction } from '@/actions/transactionActions';

type Expenses = {
  living: number;
  investment: number;
  luxury: number;
};

type DashboardClientProps = {
  budget: number;
  initialExpenses: Expenses;
};

export default function DashboardClient({ budget, initialExpenses }: DashboardClientProps) {
  const [expenses, setExpenses] = useState<Expenses>(initialExpenses);
  
  const [undoToast, setUndoToast] = useState<{
    visible: boolean;
    data: { id: string; category: Category; amount: number; date: string; title: string; memo: string } | null;
  }>({ visible: false, data: null });

  useEffect(() => {
    if (undoToast.visible) {
      const timer = setTimeout(() => {
        setUndoToast(prev => ({ ...prev, visible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [undoToast.visible]);

  const handleAddExpense = async (data: { category: Category; amount: number; date: string; title: string; memo: string }) => {
    // 1. Optimistic UI update (即時反映)
    setExpenses(prev => ({
      ...prev,
      [data.category]: prev[data.category] + data.amount
    }));

    // 2. DB保存用のカテゴリ文字列にマッピング
    const dbCategory = data.category === 'living' ? '生活費' 
                     : data.category === 'investment' ? '投資' 
                     : '贅沢費';

    try {
      // 3. Server Actionを呼び出してスプレッドシートに保存
      const addedTx = await addTransaction({
        date: data.date,
        category: dbCategory,
        content: data.title,
        amount: data.amount,
        memo: data.memo,
      });

      // 4. 「取り消し」のためにIDを保持してトーストを表示
      setUndoToast({ visible: true, data: { ...data, id: addedTx.id } });
    } catch (error) {
      console.error('Failed to add transaction', error);
      // 失敗した場合はOptimistic updateをロールバックする
      setExpenses(prev => ({
        ...prev,
        [data.category]: prev[data.category] - data.amount
      }));
      alert('保存に失敗しました。');
    }
  };

  const handleUndoClick = async () => {
    if (!undoToast.data) return;
    
    const confirmed = window.confirm(`以下の登録を取り消しますか？\n\n日付: ${undoToast.data.date}\n内容: ${undoToast.data.title}\n金額: ¥${undoToast.data.amount.toLocaleString()}`);
    if (confirmed) {
      const toastData = undoToast.data;
      
      // Optimistic revert
      setExpenses(prev => ({
        ...prev,
        [toastData.category]: prev[toastData.category] - toastData.amount
      }));
      setUndoToast({ visible: false, data: null });

      try {
        await deleteTransaction(toastData.id);
      } catch (error) {
        console.error('Failed to delete transaction', error);
        // 失敗したらUIを元に戻す
        setExpenses(prev => ({
          ...prev,
          [toastData.category]: prev[toastData.category] + toastData.amount
        }));
        alert('取り消しに失敗しました。');
      }
    }
  };

  return (
    <>
      {/* Toast Banner */}
      {undoToast.visible && undoToast.data && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-gray-900/90 dark:bg-gray-800/90 backdrop-blur-md text-white px-5 py-4 rounded-2xl shadow-2xl flex justify-between items-center border border-white/10 transition-all duration-300">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold">登録しました</span>
            <span className="text-xs text-gray-300 font-medium line-clamp-1">
              {undoToast.data.title} (¥{undoToast.data.amount.toLocaleString()})
            </span>
          </div>
          <button 
            onClick={handleUndoClick}
            className="text-blue-400 font-bold text-sm bg-blue-400/10 px-4 py-2 rounded-xl hover:bg-blue-400/20 active:bg-blue-400/30 transition-colors"
          >
            取り消し
          </button>
        </div>
      )}

      {/* Dashboard Content */}
      <div className="flex-1 px-4 pt-12 flex flex-col gap-6">
        <section className="w-full">
          <ProgressChart budget={budget} expenses={expenses} />
        </section>

        <section className="w-full mt-2">
          <ExpenseForm onSubmit={handleAddExpense} />
        </section>
      </div>
    </>
  );
}
