# Spec: MoneyDaddy Insight 프리미엄 웹 포털 디자인 스펙

* **작성일**: 2026-08-02
* **상태**: 리뷰 대기 (Pending User Review)
* **목적**: 기존 MoneyDaddy 사이트를 미국 매크로(금융), 전장 표준(기술), 일상 에세이의 세 영역으로 개편하며, 감각적인 하이엔드 UX/UI 시스템을 구축합니다.

---

## 1. 디자인 아키텍처 및 아키타입 (Design Archetype)

본 포털은 **신뢰성과 전문성을 상징하는 차분한 다크 테마(Navy-Slate)**를 근간으로 하되, 카테고리의 성격에 따라 포인트 톤을 유기적으로 변경하여 딱딱함과 친근함의 경계를 유연하게 조율합니다.

```
+---------------------------------------------------------+
| [M] 머니대디 Insight                                     |
|                                                         |
|  ( ) 📰 매크로/종목   =======>  [ Emerald Green 테마 ]   |
|  ( ) 🚗 전장 표준     =======>  [ Vibrant Indigo 테마 ]  |
|  ( ) ✍️ 생각/에세이   =======>  [ Warm Amber 테마 ]     |
+---------------------------------------------------------+
```

---

## 2. 세부 디자인 시스템 스펙 (Design System Tokens)

### A. 컬러 팔레트 (Color Palette)

| 구분 | 적용 대상 | 세부 컬러 및 Tailwind 클래스 |
| :--- | :--- | :--- |
| **기본 배경** | 메인 바디 배경 | `bg-slate-900` (#0f172a) |
| **카드 표면** | 글래스모피즘 표면 | `bg-slate-800/40` (#1e293b 기반 40% 투명도) |
| **테두리(경계)** | 카드 빛 반사 외곽선 | `border-white/10` (유리 모서리 효과) |
| **매크로/종목** | 금융 지표, 상승 지표 | `text-emerald-400` / `bg-emerald-500/20` |
| **전장시스템** | 기술 다이어그램, 스펙 표 | `text-indigo-400` / `bg-indigo-500/20` |
| **생각/에세이** | 에세이 감성 톤 강조 | `text-amber-400` (따뜻한 골드 계열) / `bg-amber-500/20` |

### B. 타이포그래피 (Dual-Typography System)

1. **정보/기술용 폰트 (Sans-serif)**: `Plus Jakarta Sans` 또는 `Inter`
   - **용도**: 대시보드 지표, 차트 수치, 사이드바 메뉴, 전장 표준 기술 문서
   - **클래스**: `font-sans text-slate-300 font-medium tracking-wide`
2. **에세이/본문용 폰트 (Serif)**: `Lora` 또는 `Playfair Display`
   - **용도**: 일상 에세이 본문, 감성 리포트 기사 본문
   - **클래스**: `font-serif text-lg leading-relaxed text-slate-100`

---

## 3. UI 컴포넌트 설계 가이드

### A. 하이엔드 글래스모피즘 카드 (Glassmorphism Card)
단순한 투명 처리가 아닌, 고급스러운 블러와 미세 그림자를 포함합니다.
```html
<div class="relative overflow-hidden rounded-2xl bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.2)] hover:border-white/20">
    <!-- 콘텐츠 구성 -->
</div>
```

### B. 카테고리 전환 마이크로 인터랙션
- 사용자가 사이드바에서 다른 탭(매크로 -> 에세이)을 누르면 페이지 전환 없이 본문 영역의 포인트 컬러(예: 테두리, 하이라이트 글자색)가 부드러운 전환 효과(`transition-colors duration-500`)를 가지며 테마 컬러가 갱신됩니다.
- 버튼 클릭 시 물리적인 깊이감을 주는 `active:scale-95 transition-transform` 애니메이션을 기본 탑재합니다.

---

## 4. 구현 및 배포 계획 (SPA 구조)

1. **단일 HTML 확장**: 기존 `index.html` 내부에 `Plus Jakarta Sans` 및 `Lora` 구글 폰트를 링크하고, 메인 컨테이너에 다크 테마 기반 스타일링을 적용합니다.
2. **동적 렌더링**: 자바스크립트로 카테고리별 상태 관리를 수행하여, 사용자가 선택한 카테고리에 맞는 아티클 리스트 및 특화 템플릿(금융 차트 / 기술 스펙 테이블 / 타이포그래피 위주 에세이 본문)이 동적으로 갈아끼워집니다.
3. **GitHub Pages 호환**: 추가 빌드 설정 없이 즉시 `https://fridayj1898.github.io/Moneydaddy/` 상에서 로드 가능합니다.

---

## 5. 모바일 경험 최적화 (Mobile-First UX Spec)

모바일 접속 비중이 높을 것을 대비하여 다음과 같은 세부 반응형 및 모바일 전용 상호작용 규칙을 강제합니다.

### A. 한 손 조작 하단 내비게이션 바 (Mobile Bottom Navigation)
* **스펙**: 모바일 화면 크기(`lg` 미만)에서는 왼쪽 드로어(Drawer) 형식의 사이드바 대신, 화면 맨 아래에 고정되는 **하단 탭 바 (Bottom Nav Bar)**를 활성화합니다.
* **이유**: 한 손으로 화면을 쥔 상태에서 엄지손가락만으로 매크로/전장/에세이 카테고리를 직관적으로 넘나들 수 있도록 하기 위함입니다.
* **디자인 토큰**: `fixed bottom-0 left-0 right-0 z-50 h-16 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center px-4`

### B. 타이포그래피 스케일 가변화 (Responsive Typography)
* 본문 폰트 크기가 모바일 기기 화면 폭에 맞춰 자동으로 스케일링되도록 유동적 글자 크기를 정의합니다.
* **매크로/전장(sans)**: 모바일 `text-xs` ↔ 데스크톱 `text-sm`
* **에세이 본문(serif)**: 모바일 `text-base leading-relaxed` ↔ 데스크톱 `text-lg leading-loose`

### C. 핀치 투 줌 / 터치 타겟 확보
* 금융 차트와 테이블은 모바일에서 잘리지 않고 가로 스크롤(`overflow-x-auto`)을 제공하거나, 터치하여 전체화면 팝업으로 상세히 볼 수 있도록 터치 영역(`p-4` 이상, 최소 44px * 44px 이상)을 확보합니다.
* 모바일 가독성을 위해 카드 좌우 여백을 모바일에서는 `px-4`로 좁히고 콘텐츠 영역을 넓히며, 데스크톱에서만 `px-8` 이상을 적용합니다.

### D. 하드웨어 가속 및 저사양 대응
* 모바일 브라우저에서 `backdrop-blur` 연산으로 인한 프레임 드랍을 막기 위해, 카드 쉐이더 연산에 GPU 가속 레이어를 강제합니다 (`will-change-transform`, `transform-gpu`).

---

## 6. 비즈니스 스케일업 및 M&A 가치 시각화 (Business Scale-Up Specs)

단순 개인 블로그를 넘어 비즈니스 매력도와 지식 IP 플랫폼으로서의 확장성을 대외적으로 보여주기 위한 UI 장치들을 추가 정의합니다.

### A. 프리미엄 리서치 페이월 (Premium Research Paywall UI)
* **목적**: 핵심 분석 자료의 일부를 등급화하여 유료화 전환이 가능한 비즈니스 모델(B2C)을 암시합니다.
* **디자인 토큰**: 아티클의 본문 중간 지점부터 아래와 같이 페이드아웃 및 자물쇠 팝업을 얹는 글래스모피즘 오버레이 처리.
  * `relative h-48 bg-gradient-to-t from-slate-900 to-transparent flex items-end justify-center pb-8`
  * 안내 문구: *"이 분석 리포트의 결론 및 핵심 밸류에이션 테이블은 Pro 멤버십 회원에게 제공됩니다."*

### B. B2B 솔루션 / 컨설팅 진입부 (Corporate Inquiry Gate)
* **목적**: AUTOSAR/ISO 26262 등 전장 기술 표준과 매크로 리스크 컨설팅을 즉시 문의할 수 있는 통로(B2B)를 상시 노출하여 전문 사업성을 강조합니다.
* **스펙**: 사이드바 하단 및 모바일 내비게이션 영역에 고대비 폰트로 **"💼 B2B Solutions"** 또는 **"자문/컨설팅 문의"** 전용 다이얼로그 진입 링크를 신설합니다.

### C. 데이터 API 비즈니스 연계성 노출 (Developer / API Gate)
* **목적**: 단순 지식 전달 포털을 넘어, 가공된 데이터를 API 형태로 서비스화(B2B2C)할 수 있는 기술적 확장성을 암시합니다.
* **스펙**: 사이트 하단(Footer)에 **`API Access`**, **`Data Center`** 메뉴를 비활성화(혹은 "Coming Soon/Enterprise 문의") 상태로라도 노출하여 기술 지향적 스케일업 가치를 시각적으로 전달합니다.

### D. 실시간 마켓 티커 위젯 (Live Ticker Widget)
* **목적**: 실시간 금융 및 주요 인프라 기술 지표가 흘러가는 마이크로 인터랙션을 상단 헤더 영역에 매핑하여, 플랫폼의 활동성(Liveness)과 전문 정보 큐레이팅 느낌을 동시에 배가합니다.


