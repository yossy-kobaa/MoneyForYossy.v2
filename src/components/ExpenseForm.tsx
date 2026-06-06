'use client';

import React, { useState, useEffect } from 'react';

export type Category = 'living' | 'investment' | 'luxury';

type ExpenseFormProps = {
  onSubmit: (data: { category: Category; amount: number; date: string; title: string; memo: string }) => void;
};

export default function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const [category, setCategory] = useState<Category>('living');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [date, setDate] = useState(getLocalDateString());
  const [memo, setMemo] = useState('');
  const [isTenkeyOpen, setIsTenkeyOpen] = useState(false);

  useEffect(() => {
    if (isTenkeyOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isTenkeyOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title || !date) return;
    
    onSubmit({
      category,
      amount: Number(amount),
      title,
      date,
      memo
    });

    // Reset some fields
    setAmount('');
    setTitle('');
    setMemo('');
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="w-full flex flex-col gap-6 p-6 bg-white/70 dark:bg-black/40 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/40 dark:border-white/10"
    >

      {/* Segmented Control */}
      <div className="relative flex w-full p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl">
        {/* Active background slider */}
        <div 
          className="absolute top-1 bottom-1 w-[calc(33.333%-0.3rem)] bg-white dark:bg-gray-600 rounded-xl shadow-sm transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(${category === 'living' ? '0' : category === 'investment' ? '103%' : '206%'})`
          }}
        />
        
        <label className="relative z-10 flex-1 cursor-pointer">
          <input 
            type="radio" 
            name="category" 
            value="living" 
            className="sr-only"
            checked={category === 'living'}
            onChange={() => setCategory('living')}
          />
          <div className={`py-2.5 text-center text-sm font-semibold transition-colors duration-300 ${category === 'living' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            生活費
          </div>
        </label>
        <label className="relative z-10 flex-1 cursor-pointer">
          <input 
            type="radio" 
            name="category" 
            value="investment" 
            className="sr-only"
            checked={category === 'investment'}
            onChange={() => setCategory('investment')}
          />
          <div className={`py-2.5 text-center text-sm font-semibold transition-colors duration-300 ${category === 'investment' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            投資
          </div>
        </label>
        <label className="relative z-10 flex-1 cursor-pointer">
          <input 
            type="radio" 
            name="category" 
            value="luxury" 
            className="sr-only"
            checked={category === 'luxury'}
            onChange={() => setCategory('luxury')}
          />
          <div className={`py-2.5 text-center text-sm font-semibold transition-colors duration-300 ${category === 'luxury' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
            贅沢費
          </div>
        </label>
      </div>

      <div className="flex flex-col gap-4">
        {/* Date Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">日付</label>
          <input 
            type="date" 
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 font-medium [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        {/* Title Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">内容</label>
          <input 
            type="text" 
            placeholder="例：スーパーでの買い物" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 font-medium"
          />
        </div>

        {/* Amount Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">金額</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">¥</span>
            <input 
              type="text" 
              readOnly
              placeholder="0" 
              required
              value={amount ? Number(amount).toLocaleString() : ''}
              onClick={() => setIsTenkeyOpen(true)}
              className="w-full pl-9 pr-12 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 font-medium text-lg cursor-pointer"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
                <line x1="8" y1="9" x2="8" y2="9" />
                <line x1="12" y1="9" x2="12" y2="9" />
                <line x1="16" y1="9" x2="16" y2="9" />
                <line x1="8" y1="13" x2="8" y2="13" />
                <line x1="12" y1="13" x2="12" y2="13" />
                <line x1="16" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="8" y2="17" />
                <line x1="12" y1="17" x2="12" y2="17" />
                <line x1="16" y1="17" x2="16" y2="17" />
              </svg>
            </div>
          </div>
        </div>

        {/* Memo Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 ml-1">メモ (任意)</label>
          <input 
            type="text" 
            placeholder="詳細な情報があれば" 
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400 font-medium"
          />
        </div>
      </div>

      <button 
        type="submit"
        className="mt-2 w-full py-4 bg-gray-900 hover:bg-gray-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]"
      >
        登録する
      </button>

      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isTenkeyOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={() => setIsTenkeyOpen(false)}
      />

      {/* Tenkey Bottom Sheet */}
      <div 
        className={`fixed inset-x-0 bottom-0 z-50 bg-gray-100 dark:bg-gray-900 rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-white/20 dark:border-gray-800 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${isTenkeyOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div className="p-6 flex flex-col items-center">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-6 cursor-pointer" onClick={() => setIsTenkeyOpen(false)} />
          
          <div className="text-3xl font-bold mb-6 text-gray-900 dark:text-white tracking-tight w-full text-center bg-white dark:bg-gray-800 py-4 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700">
            ¥ {amount ? Number(amount).toLocaleString() : '0'}
          </div>
          
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === 'C') setAmount('');
                  else if (key === 'OK') setIsTenkeyOpen(false);
                  else {
                    if (amount.length < 10) setAmount(prev => prev + key);
                  }
                }}
                className={`py-5 text-2xl font-semibold rounded-2xl active:scale-95 transition-all shadow-sm ${
                  key === 'OK' ? 'bg-blue-600 text-white shadow-blue-500/30' : 
                  key === 'C' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                  'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}
