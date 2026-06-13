import { useEffect, useRef, useState } from "react";
import type { DashboardNavItem } from "../lib/dashboardGroups";

interface GroupNavBarProps {
  items: DashboardNavItem[];
  idPrefix: string;          // 섹션 element id = idPrefix + item.id
  stickyTop: number;         // sticky 고정 위치(px) — 헤더·메인 탭바 아래
  scrollMarginTop: number;   // 섹션 scroll-margin-top 과 동일값 — 스크롤 착지 위치 보정용
  compact?: boolean;         // 모바일: 더 작은 폰트/패딩
}

// 지수 그룹 색인 칩바 — 상단 고정. 칩 클릭 시 해당 그룹으로 부드럽게 스크롤,
//   스크롤 위치에 따라 현재 보는 그룹 칩 자동 하이라이트(scroll-spy) + 바 안에서 가운데로 이동.
export function GroupNavBar({ items, idPrefix, stickyTop, scrollMarginTop, compact }: GroupNavBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(items[0]?.id ?? "");

  // scroll-spy — sticky 바 바로 아래(probe)를 지나간 마지막 섹션을 현재 그룹으로
  useEffect(() => {
    const handler = () => {
      const probe = scrollMarginTop + 4;
      let cur = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(idPrefix + it.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= probe) cur = it.id;
        else break;
      }
      setActive(cur);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [items, idPrefix, scrollMarginTop]);

  // 활성 칩을 바(가로 스크롤) 안에서 보이게 — 페이지 스크롤은 건드리지 않고 바만 이동
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const el = bar.querySelector<HTMLElement>(`[data-chip="${active}"]`);
    if (!el) return;
    const left = el.offsetLeft;
    const right = left + el.offsetWidth;
    if (left < bar.scrollLeft) bar.scrollTo({ left: left - 8, behavior: "smooth" });
    else if (right > bar.scrollLeft + bar.clientWidth) {
      bar.scrollTo({ left: right - bar.clientWidth + 8, behavior: "smooth" });
    }
  }, [active]);

  const go = (id: string) => {
    const el = document.getElementById(idPrefix + id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  if (items.length === 0) return null;

  return (
    <div ref={barRef} data-noswipe
         style={{ top: stickyTop }}
         className="sticky z-30 -mx-3 px-3 py-1.5 bg-white/95 backdrop-blur
                    border-b border-gray-200 flex items-center gap-1
                    overflow-x-auto whitespace-nowrap">
      {items.map(it => {
        const on = it.id === active;
        return (
          <button key={it.id} data-chip={it.id} onClick={() => go(it.id)}
                  title={`${it.emoji} ${it.short} 그룹으로 이동`}
                  className={`shrink-0 rounded-full transition inline-flex items-center gap-1
                              ${compact ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}
                              ${on ? "bg-blue-600 text-white font-bold"
                                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <span>{it.emoji}</span>
            <span>{it.short}</span>
          </button>
        );
      })}
    </div>
  );
}
