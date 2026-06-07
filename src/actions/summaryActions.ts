"use server";

import { getGoogleSheetDocument } from '../lib/googleSheets';

const SUMMARY_SHEET_TITLE = '月別集計';
const TRANSACTIONS_SHEET_TITLE = 'Transactions';

/**
 * 現在の年月 (YYYY-MM) を取得
 */
function getCurrentYearMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 先月の年月 (YYYY-MM) を取得
 */
function getPreviousYearMonth() {
  const now = new Date();
  now.setMonth(now.getMonth() - 1);
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * 指定した年月の集計を計算し、月別集計シートを更新する
 */
export async function syncMonthlySummary(targetYearMonth: string): Promise<void> {
  try {
    const doc = await getGoogleSheetDocument();
    
    // Transactionsシートからデータを取得
    let transSheet = doc.sheetsByTitle[TRANSACTIONS_SHEET_TITLE];
    if (!transSheet) transSheet = doc.sheetsByIndex[0];
    const transRows = await transSheet.getRows();
    
    // 指定月のトランザクションを抽出
    const targetTransactions = transRows
      .filter(row => {
        const date = row.get('日付');
        return date && date.startsWith(targetYearMonth);
      })
      .map(row => ({
        category: row.get('カテゴリ') || '',
        amount: Number(row.get('金額')) || 0
      }));
    
    // カテゴリごとの集計と合計を計算
    let total = 0;
    const categoryTotals: Record<string, number> = {};
    
    for (const t of targetTransactions) {
      total += t.amount;
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = 0;
      }
      categoryTotals[t.category] += t.amount;
    }

    const doc = await getGoogleSheetDocument();
    
    // 月別集計シートを取得、なければ作成
    let summarySheet = doc.sheetsByTitle[SUMMARY_SHEET_TITLE];
    if (!summarySheet) {
      summarySheet = await doc.addSheet({
        title: SUMMARY_SHEET_TITLE,
        headerValues: ['年月', '合計'],
      });
    }

    // 現在のヘッダーを取得
    let headers: string[] = [];
    try {
      await summarySheet.loadHeaderRow();
      headers = [...summarySheet.headerValues];
    } catch (e) {
      // ヘッダーがない場合は初期化
      headers = ['年月', '合計'];
      await summarySheet.setHeaderRow(headers);
    }
    
    // 新しいカテゴリがあればヘッダーに追加
    let headersUpdated = false;
    for (const category of Object.keys(categoryTotals)) {
      if (!headers.includes(category) && category.trim() !== '') {
        headers.push(category);
        headersUpdated = true;
      }
    }
    
    if (headersUpdated) {
      await summarySheet.setHeaderRow(headers);
    }

    // 既存の行を検索して更新、なければ追加
    const rows = await summarySheet.getRows();
    const existingRow = rows.find(r => r.get('年月') === targetYearMonth);
    
    const rowData: Record<string, string | number> = {
      '年月': targetYearMonth,
      '合計': total,
    };
    
    // 全カテゴリの値をセット (存在しないカテゴリは0にする)
    for (const header of headers) {
      if (header !== '年月' && header !== '合計') {
        rowData[header] = categoryTotals[header] || 0;
      }
    }

    if (existingRow) {
      // update
      for (const key of Object.keys(rowData)) {
        existingRow.set(key, rowData[key]);
      }
      await existingRow.save();
    } else {
      // add
      await summarySheet.addRow(rowData);
    }

  } catch (error) {
    console.error(`Failed to sync monthly summary for ${targetYearMonth}:`, error);
  }
}

/**
 * 先月分の集計が作成されているかチェックし、なければ作成する
 */
export async function checkAndSyncPreviousMonth(): Promise<void> {
  try {
    const prevYearMonth = getPreviousYearMonth();
    
    const doc = await getGoogleSheetDocument();
    const summarySheet = doc.sheetsByTitle[SUMMARY_SHEET_TITLE];
    
    if (!summarySheet) {
      // シート自体が存在しない場合は集計を実行
      await syncMonthlySummary(prevYearMonth);
      return;
    }
    
    const rows = await summarySheet.getRows();
    const existingRow = rows.find(r => r.get('年月') === prevYearMonth);
    
    if (!existingRow) {
      // 先月分のデータがなければ集計を実行
      await syncMonthlySummary(prevYearMonth);
    }
  } catch (error) {
    console.error('Failed to check and sync previous month summary:', error);
  }
}

/**
 * 渡された日付が現在の月より前の場合、該当月の集計を更新する
 */
export async function syncIfPastMonth(dateStr: string): Promise<void> {
  if (!dateStr || dateStr.length < 7) return; // 'YYYY-MM-DD' etc
  const targetYearMonth = dateStr.substring(0, 7); // 'YYYY-MM'
  const currentYearMonth = getCurrentYearMonth();
  
  if (targetYearMonth < currentYearMonth) {
    await syncMonthlySummary(targetYearMonth);
  }
}
