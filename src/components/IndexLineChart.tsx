// 지수 미니 라인 차트 — KOSPI/KOSDAQ 등 단순 종가 라인 + 거래량 (선택)
//   InvestorChartLight 와 같은 카드/툴팁 스타일로 4열 그리드에 잘 어울리도록.

import { useEffect, useRef } from "react";
import {
  createChart,
  ColorType,
  LineSeries,
  CandlestickSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type SeriesType,
  type LogicalRange,
  type MouseEventParams,
  type Time,
} from "lightweight-charts";
import type { PricePoint } from "../lib/api";

const UP_COLOR   = "#dc2626";   // 양봉 / 라인 (한국식 빨강)
const DN_COLOR   = "#2563eb";   // 음봉 (한국식 파랑)

interface Props {
  label: string;                      // "KOSPI" 등
  prices: PricePoint[];               // 날짜순 (오래됨 → 최신)
  heightClass?: string;               // Tailwind 높이 (기본 "h-[180px]")
  mode?: "line" | "candle";           // 기본 line
  onToggleMode?: () => void;          // 차트 우상단 캔들 토글 (옵션)
  onReady?: (
    chart: IChartApi,
    anchor: ISeriesApi<SeriesType>,
    onSyncedHover?: (time: Time | null) => void,
  ) => (() => void) | void;
}

function fmtIndex(v: number): string {
  return v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(2);
}

export function IndexLineChart({
  label, prices, heightClass = "h-[180px]", mode = "line", onToggleMode, onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const visibleRangeRef = useRef<LogicalRange | null>(null);

  const last = prices.length > 0 ? prices[prices.length - 1] : null;
  const first = prices.length > 0 ? prices[0] : null;
  const trendUp = last && first ? last.close >= first.close : true;
  const lineColor = trendUp ? UP_COLOR : DN_COLOR;

  useEffect(() => {
    if (!containerRef.current) return;
    if (prices.length < 2) return;

    const chart: IChartApi = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#374151",
        fontSize: 10,
        fontFamily: "system-ui, -apple-system, sans-serif",
      },
      grid: {
        vertLines: { color: "#f3f4f6" },
        horzLines: { color: "#f3f4f6" },
      },
      rightPriceScale: {
        borderColor: "#e5e7eb",
        scaleMargins: { top: 0.08, bottom: 0.08 },
        minimumWidth: 64,    // 4 미니 차트와 폭 통일 (X축 정렬용)
      },
      leftPriceScale: { visible: false },
      timeScale: {
        borderColor: "#e5e7eb",
        timeVisible: false,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "#9ca3af", width: 1, style: LineStyle.Dotted,
          labelBackgroundColor: "#475569",
        },
        horzLine: {
          color: "#9ca3af", width: 1, style: LineStyle.Dotted,
          labelVisible: false,
        },
      },
      autoSize: true,
    });

    // 가격 series — 모드에 따라 라인 / 캔들 분기
    let priceSeries: ISeriesApi<SeriesType>;
    if (mode === "candle") {
      const candleData = prices
        .filter(p => p.open != null && p.high != null && p.low != null)
        .map(p => ({
          time: p.date as Time,
          open: p.open!, high: p.high!, low: p.low!, close: p.close,
        }));
      const s = chart.addSeries(CandlestickSeries, {
        upColor: UP_COLOR, downColor: DN_COLOR,
        borderUpColor: UP_COLOR, borderDownColor: DN_COLOR,
        wickUpColor: UP_COLOR, wickDownColor: DN_COLOR,
        priceLineVisible: false, lastValueVisible: false,
      });
      s.setData(candleData);
      priceSeries = s;
    } else {
      const s = chart.addSeries(LineSeries, {
        color: lineColor,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
      });
      s.setData(prices.map(p => ({ time: p.date as Time, value: p.close })));
      priceSeries = s;
    }

    // 거래량 히스토그램 제거 — Yahoo 가 indices 에 대해 의미있는 거래량 미제공

    // 줌 복원
    if (visibleRangeRef.current) {
      chart.timeScale().setVisibleLogicalRange(visibleRangeRef.current);
    } else {
      chart.timeScale().fitContent();
    }
    const rangeHandler = (range: LogicalRange | null) => {
      if (range) visibleRangeRef.current = range;
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(rangeHandler);

    const priceMap = new Map(prices.map(p => [p.date, p]));

    const hideTooltip = () => {
      if (tooltipRef.current) tooltipRef.current.style.display = "none";
    };

    const updateTooltipForTime = (time: Time): boolean => {
      const tip = tooltipRef.current;
      const container = containerRef.current;
      if (!tip || !container) return false;
      const x = chart.timeScale().timeToCoordinate(time);
      const p = priceMap.get(String(time));
      if (x == null || !p) { hideTooltip(); return false; }
      const y = priceSeries.priceToCoordinate(p.close);
      if (y == null) { hideTooltip(); return false; }
      let content = `<div class="text-[10px] text-gray-400 mb-0.5">${String(time)}</div>`;
      if (mode === "candle" && p.open != null && p.high != null && p.low != null) {
        const isUp = p.close >= p.open;
        const c = isUp ? UP_COLOR : DN_COLOR;
        content += `<div><span class="text-gray-500">시가 </span><span style="color:${c}">${fmtIndex(p.open)}</span></div>`;
        content += `<div><span class="text-gray-500">고가 </span><span style="color:${c}">${fmtIndex(p.high)}</span></div>`;
        content += `<div><span class="text-gray-500">저가 </span><span style="color:${c}">${fmtIndex(p.low)}</span></div>`;
        content += `<div><span class="text-gray-500">종가 </span><span style="color:${c}" class="font-bold">${fmtIndex(p.close)}</span></div>`;
      } else {
        content += `<div><span class="text-gray-500">종가 </span><span style="color:${lineColor}" class="font-bold">${fmtIndex(p.close)}</span></div>`;
      }
      tip.innerHTML = content;
      tip.style.display = "block";
      const W = container.clientWidth;
      const H = container.clientHeight;
      const tw = tip.offsetWidth || 100;
      const th = tip.offsetHeight || 40;
      let left = x + 12;
      let top = y + 12;
      if (left + tw > W - 4) left = x - tw - 12;
      if (top + th > H - 4) top = y - th - 12;
      if (left < 4) left = 4;
      if (top < 4) top = 4;
      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
      return true;
    };

    const tooltipHandler = (param: MouseEventParams) => {
      if (!param.time) { hideTooltip(); return; }
      updateTooltipForTime(param.time);
    };
    chart.subscribeCrosshairMove(tooltipHandler);

    // 다른 차트에서 sync 호출 시 — 자체 데이터로 crosshair + 툴팁 갱신
    const onSyncedHover = (time: Time | null) => {
      if (time == null) {
        chart.clearCrosshairPosition();
        hideTooltip();
        return;
      }
      const p = priceMap.get(String(time));
      if (p) chart.setCrosshairPosition(p.close, time, priceSeries);
      updateTooltipForTime(time);
    };

    const cleanupSync = onReady?.(chart, priceSeries, onSyncedHover);

    return () => {
      if (typeof cleanupSync === "function") cleanupSync();
      try { chart.unsubscribeCrosshairMove(tooltipHandler); } catch { /* noop */ }
      try { chart.timeScale().unsubscribeVisibleLogicalRangeChange(rangeHandler); }
      catch { /* removed */ }
      chart.remove();
    };
  }, [prices, lineColor, mode, onReady]);

  return (
    <div className="border border-gray-200 rounded p-2 bg-white">
      <div className="flex items-baseline gap-2 text-xs mb-1 flex-wrap">
        <span className="font-bold" style={{ color: lineColor }}>{label}</span>
        {last && (
          <span className="tabular-nums font-bold" style={{ color: lineColor }}>
            {fmtIndex(last.close)}
          </span>
        )}
        {last && first && (
          <span className={`tabular-nums text-[10px]
                            ${last.close >= first.close ? "text-rose-600" : "text-blue-600"}`}>
            {(((last.close - first.close) / first.close) * 100).toFixed(2)}%
          </span>
        )}
        <span className="text-gray-400 text-[10px] ml-auto">200일</span>
        {/* 캔들 모드 토글 — 차트 헤더 우상단 */}
        {onToggleMode && (
          <button onClick={onToggleMode}
                  title={mode === "candle" ? "라인 차트로" : "캔들 차트로"}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                    mode === "candle"
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : "text-gray-400 border-gray-200 hover:bg-gray-100"
                  }`}>
            🕯 캔들 {mode === "candle" ? "ON" : "OFF"}
          </button>
        )}
      </div>
      <div className="relative">
        <div ref={containerRef} className={`w-full ${heightClass}`} />
        <div ref={tooltipRef}
             className="absolute pointer-events-none bg-white/95 border border-gray-200 rounded shadow-md
                        px-2 py-1 text-xs text-gray-700 tabular-nums z-10 leading-snug"
             style={{ display: "none" }} />
      </div>
    </div>
  );
}

export default IndexLineChart;
