"use server";

import { getTransactions } from './transactionActions';

/**
 * 取引履歴データから、すでに入力されているカテゴリのユニークな一覧を抽出して取得する
 */
export async function getCategories(): Promise<string[]> {
  try {
    // Transactionsシートのデータをすべて取得
    const transactions = await getTransactions();
    
    // 取引データの中からカテゴリを抽出し、空文字を除外
    const allCategories = transactions
      .map(t => t.category)
      .filter(c => c && c.trim() !== '');
      
    // 重複を削除してユニークな配列にする
    const uniqueCategories = Array.from(new Set(allCategories));
    
    return uniqueCategories;
  } catch (error) {
    console.error('Failed to get categories from transactions:', error);
    throw new Error('カテゴリ一覧の抽出に失敗しました');
  }
}
