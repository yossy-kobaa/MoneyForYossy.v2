"use server";

import { getGoogleSheetDocument } from '../lib/googleSheets';
import { checkAndSyncPreviousMonth, syncIfPastMonth } from './summaryActions';

export type Transaction = {
  id: string;
  date: string;
  category: string;
  content: string;
  amount: number;
  memo: string;
};

// スプレッドシートのシート名（環境に合わせて変更可能）
const TRANSACTIONS_SHEET_TITLE = 'Transactions';

/**
 * 取引履歴を全件取得する
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    // 非同期または同期で先月分の集計チェックを実行
    // （初回ロード時の遅延を防ぐためPromiseを待たずにバックグラウンド実行も可能だが、
    // ここでは安全のためawaitする。既に集計済みの場合は高速に終わる）
    await checkAndSyncPreviousMonth();

    const doc = await getGoogleSheetDocument();
    
    // シートが見つからない場合は最初のシート（インデックス0）をフォールバックとして使用する
    let sheet = doc.sheetsByTitle[TRANSACTIONS_SHEET_TITLE];
    if (!sheet) {
      sheet = doc.sheetsByIndex[0]; 
    }

    const rows = await sheet.getRows();
    
    return rows.map(row => ({
      id: row.rowNumber.toString(),
      date: row.get('日付') || '',
      category: row.get('カテゴリ') || '',
      content: row.get('内容') || '',
      amount: Number(row.get('金額')) || 0,
      memo: row.get('メモ') || '',
    }));
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw new Error('取引データの取得に失敗しました');
  }
}

/**
 * 新しい取引を追加する
 */
export async function addTransaction(
  data: Omit<Transaction, 'id'>
): Promise<Transaction> {
  try {
    const doc = await getGoogleSheetDocument();
    let sheet = doc.sheetsByTitle[TRANSACTIONS_SHEET_TITLE];
    if (!sheet) {
      sheet = doc.sheetsByIndex[0];
    }

    const newRow = await sheet.addRow({
      '日付': data.date,
      'カテゴリ': data.category,
      '内容': data.content,
      '金額': data.amount,
      'メモ': data.memo || '',
    });

    // もし過去の月のデータなら逐次集計を走らせる
    await syncIfPastMonth(data.date);

    return {
      id: newRow.rowNumber.toString(),
      ...data,
    };
  } catch (error) {
    console.error('Failed to add transaction:', error);
    throw new Error('取引データの追加に失敗しました');
  }
}

/**
 * 取引を更新する
 */
export async function updateTransaction(
  id: string,
  data: Omit<Transaction, 'id'>
): Promise<boolean> {
  try {
    const doc = await getGoogleSheetDocument();
    let sheet = doc.sheetsByTitle[TRANSACTIONS_SHEET_TITLE];
    if (!sheet) {
      sheet = doc.sheetsByIndex[0];
    }

    const rows = await sheet.getRows();
    const rowToUpdate = rows.find(row => row.rowNumber.toString() === id);

    if (!rowToUpdate) {
      throw new Error(`ID: ${id} のデータが見つかりません`);
    }

    const oldDate = rowToUpdate.get('日付') || '';

    rowToUpdate.set('日付', data.date);
    rowToUpdate.set('カテゴリ', data.category);
    rowToUpdate.set('内容', data.content);
    rowToUpdate.set('金額', data.amount);
    rowToUpdate.set('メモ', data.memo || '');

    await rowToUpdate.save();

    // 更新により月が変わる可能性があるため、新旧両方で必要に応じて集計を更新
    const oldYearMonth = oldDate.substring(0, 7);
    const newYearMonth = data.date.substring(0, 7);
    
    await syncIfPastMonth(data.date);
    if (oldYearMonth !== newYearMonth) {
      await syncIfPastMonth(oldDate);
    }

    return true;
  } catch (error) {
    console.error('Failed to update transaction:', error);
    throw new Error('取引データの更新に失敗しました');
  }
}

/**
 * 取引を削除する
 */
export async function deleteTransaction(id: string): Promise<boolean> {
  try {
    const doc = await getGoogleSheetDocument();
    let sheet = doc.sheetsByTitle[TRANSACTIONS_SHEET_TITLE];
    if (!sheet) {
      sheet = doc.sheetsByIndex[0];
    }

    const rows = await sheet.getRows();
    const rowToDelete = rows.find(row => row.rowNumber.toString() === id);

    if (!rowToDelete) {
      throw new Error(`ID: ${id} のデータが見つかりません`);
    }

    const deletedDate = rowToDelete.get('日付') || '';

    await rowToDelete.delete();
    
    // 過去の月なら再集計
    await syncIfPastMonth(deletedDate);

    return true;
  } catch (error) {
    console.error('Failed to delete transaction:', error);
    throw new Error('取引データの削除に失敗しました');
  }
}
