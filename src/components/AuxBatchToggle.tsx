// 모든 카드의 추가지표 블럭을 일괄 닫기 / 열기 토글
// — window event 로 AuxIndicators 들에 broadcast

import { useState } from "react";

interface Props {
  short?: boolean;   // true 면 "닫기/열기" 만, false 면 "일괄 닫기/일괄 열기"
}

export function AuxBatchToggle({ short = false }: Props) {
  const [mode, setMode] = useState<"close" | "open">("close");

  const click = () => {
    const event = mode === "close" ? "aux:closeAll" : "aux:openAll";
    window.dispatchEvent(new Event(event));
    setMode(mode === "close" ? "open" : "close");
  };

  const arrow = mode === "close" ? "▼" : "▲";
  const label = mode === "close"
    ? (short ? "일괄 닫기" : "추가지표 일괄 닫기")
    : (short ? "일괄 열기" : "추가지표 일괄 열기");

  return (
    <button onClick={click}
            title={mode === "close"
              ? "모든 카드의 추가지표 블럭을 한 번에 접음"
              : "모든 카드의 추가지표 블럭을 한 번에 펼침"}
            className="text-xs text-gray-500 hover:text-gray-800 px-1.5 py-0.5
                       border border-gray-300 rounded bg-white">
      {arrow} {label}
    </button>
  );
}
