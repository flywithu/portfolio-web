// 개발자 후원 모달 — PC + 모바일 공통 사용.
// 클릭 즉시 외부 페이지로 이동하지 않고, 설명 + QR + "직접 열기" 버튼 한 단계 거침.

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const KAKAOPAY_URL = "https://qr.kakaopay.com/FCscirjeF";
const QR_IMG_URL =
  `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(KAKAOPAY_URL)}`;

export function DonateDialog({ isOpen, onClose }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 p-4"
         onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 text-center"
           onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1">☕ 후원해주셔서 감사합니다</h2>
        <p className="text-xs text-gray-600 leading-relaxed mb-4">
          모인 후원금은 <b>Cloudflare Worker 운영비</b>,
          <br />그리고 <b>꾸준한 기능 개발·유지보수</b>에 사용됩니다.
        </p>
        {/* QR — 데스크톱(sm 이상) 에서만 표시. 모바일은 스캔 불편 → 큰 버튼만 노출 */}
        <div className="hidden sm:inline-block bg-[#FEE500] rounded-lg p-4 mb-3">
          <img src={QR_IMG_URL} alt="카카오페이 QR" width={200} height={200}
               className="block mx-auto" />
        </div>
        <p className="hidden sm:block text-xs text-gray-600 mb-1">
          📱 <strong>카카오톡 앱</strong>의 QR 스캔이 가장 빠릅니다
        </p>
        <p className="hidden sm:block text-[11px] text-gray-400 mb-3">
          카메라/토스로 스캔 시 카카오톡으로 자동 이동
        </p>
        {/* 모바일 전용 안내 — QR 대신 버튼 클릭 유도 */}
        <p className="sm:hidden text-xs text-gray-600 mb-3">
          아래 버튼을 누르면 카카오페이로 바로 이동합니다 📱
        </p>
        <a href={KAKAOPAY_URL}
           target="_blank" rel="noopener noreferrer"
           className="block px-4 py-3 sm:py-2 rounded font-bold text-[#191919]
                      hover:brightness-95 text-base sm:text-sm"
           style={{ backgroundColor: "#FEE500" }}>
          💛 카카오페이로 후원하기
        </a>
        <button onClick={onClose}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700">
          닫기
        </button>
      </div>
    </div>
  );
}
