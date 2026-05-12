import type { Stock, Price } from "../types";
import { formatSigned } from "../lib/format";

interface Props {
  holdings: Stock[];
  prices: Map<string, Price>;
}

// 오늘 손익(보유 수량 가중) 종목 리스트 — 수익팀/손해팀 2테이블.
// TotalRow 오른쪽에 같은 줄로 붙는 sticky 박스. holdings 가 없거나 모두 0 이면 null.
export function TodayPnLTable({ holdings, prices }: Props) {
  type Row = { ticker: string; name: string; amount: number };
  const winners: Row[] = [];
  const losers: Row[] = [];

  for (const s of holdings) {
    if (s.shares <= 0) continue;
    const p = prices.get(s.ticker);
    if (!p || p.base <= 0) continue;
    const amount = (p.price - p.base) * s.shares;
    if (amount === 0) continue;
    const row: Row = { ticker: s.ticker, name: s.name || s.ticker, amount };
    if (amount > 0) winners.push(row);
    else losers.push(row);
  }

  if (winners.length === 0 && losers.length === 0) return null;

  winners.sort((a, b) => b.amount - a.amount);  // 많이 번 순
  losers.sort((a, b) => a.amount - b.amount);   // 많이 까먹은 순

  const winSum = winners.reduce((acc, r) => acc + r.amount, 0);
  const loseSum = losers.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="flex gap-2 text-xs">
      <MiniTable
        title="오늘 수익"
        rows={winners}
        total={winSum}
        colorClass="text-rose-600"
        headerBg="bg-rose-50"
      />
      <MiniTable
        title="오늘 손해"
        rows={losers}
        total={loseSum}
        colorClass="text-blue-600"
        headerBg="bg-blue-50"
      />
    </div>
  );
}

interface MiniProps {
  title: string;
  rows: { ticker: string; name: string; amount: number }[];
  total: number;
  colorClass: string;
  headerBg: string;
}

function MiniTable({ title, rows, total, colorClass, headerBg }: MiniProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-md
                    overflow-hidden min-w-[160px] max-w-[220px]">
      <div className={`px-2 py-1 ${headerBg} ${colorClass} font-semibold
                        text-[11px] border-b border-gray-200`}>
        {title}
      </div>
      {rows.length === 0 ? (
        <div className="px-2 py-2 text-gray-400 text-[11px]">없음</div>
      ) : (
        <div className="max-h-[140px] overflow-y-auto">
          <table className="w-full tabular-nums">
            <tbody>
              {rows.map(r => (
                <tr key={r.ticker} className="border-b border-gray-100 last:border-0">
                  <td className="px-2 py-0.5 truncate max-w-[100px] text-gray-700">
                    {r.name}
                  </td>
                  <td className={`px-2 py-0.5 text-right font-medium ${colorClass}`}>
                    {formatSigned(r.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className={`px-2 py-1 border-t border-gray-300 bg-gray-50
                        flex justify-between items-baseline`}>
        <span className="text-gray-500 text-[11px]">총액</span>
        <span className={`font-bold ${colorClass} tabular-nums`}>
          {formatSigned(total)}원
        </span>
      </div>
    </div>
  );
}
