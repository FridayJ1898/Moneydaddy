# MoneyDaddy HTML & Frontend Architecture Redesign Specification

**Date:** 2026-08-30  
**Author:** Antigravity AI  
**Status:** Approved / Proposed Design  

---

## 1. 개요 (Overview)

현재 `MoneyDaddy` 웹사이트의 `index.html`은 4,165줄(404KB) 규모의 초거대 단일 파일(Monolithic Single-File) 구조로 되어 있어 다음과 같은 심각한 문제가 존재합니다.

- **유지보수 저해**: HTML 마크업, CSS 스타일, Tailwind CDN, JavaScript 비즈니스 로직, 마스터 데이터, 리포트 본문 HTML 렌더러가 단일 파일에 얽혀 있음.
- **콘텐츠 관리 비효율**: 새로운 투자 리포트나 아티클을 추가/수정할 때마다 4,000줄이 넘는 코드를 직접 편집해야 함.
- **성능 및 확장성 문제**: 브라우저 런타임 Tailwind CSS 파싱 과부하, dynamic HTML 렌더링 시 모듈화 부재.

본 설계 문서는 기존의 웹 서버 실행 환경(No-Build / Simple Static Web Hosting)을 그대로 유지하면서, **데이터·콘텐츠·렌더링 로직·스타일을 완벽히 분리(Decoupling)**하여 코드 유지보수성과 웹 성능을 극대화하는 모듈화 아키텍처를 제시합니다.

---

## 2. 목표 (Goals)

1. **`index.html` 슬림화**: 4,165줄의 `index.html`을 핵심 App Shell(약 200~300줄) 수준으로 축소.
2. **데이터 및 리포트 독립 파일화**:
   - 포스트 목록 및 ETF 마스터 DB를 JSON 파일 (`data/posts.json`, `data/etf_master.json`)로 완전 분리.
   - 각 리포트 본문 HTML/컨텐츠를 `content/reports/*.html` 분리 파일로 저장하여 필요 시 비동기(`fetch`) 로드.
3. **자바스크립트 모듈화 (ES Modules / Script Separation)**:
   - UI 제어, 카테고리 탭, 사이드바, 검색/정렬, 대시보드 렌더러를 기능별 JS 모듈로 분리.
4. **스타일 구조화**:
   - CSS 디자인 토큰(`variables.css`), 레이아웃/유틸리티(`styles.css`) 분리.

---

## 3. 타겟 디렉토리 구조 (Target Directory Structure)

```text
MoneyDaddy/
├── index.html                  # 메인 App Shell (사이드바, 모바일 navigation, 렌더링 컨테이너)
├── css/
│   ├── variables.css           # 디자인 토큰 (:root 테마 변수, 색상, 애니메이션)
│   └── styles.css              # 커스텀 컴포넌트, 글래스모피즘, Responsive media queries
├── js/
│   ├── app.js                  # 메인 애플리케이션 진입점 & 이벤트 바인딩
│   ├── store.js                # posts.json, etf_master.json 로딩 및 상태 관리
│   ├── ui.js                   # 사이드바, 모바일 메뉴, 카테고리 탭, 검색/정렬 제어
│   └── renderers/
│       ├── report-loader.js    # 동적 리포트 HTML 비동기 로더 & MathJax/Chart.js 바인딩
│       ├── etf-dashboard.js    # ETF 비교 분석 대시보드 렌더러
│       └── dictionary.js       # 백과사전 렌더러
├── data/
│   ├── posts.json              # 포스트 목록 메타데이터
│   └── etf_master.json         # ETF 종목 마스터 데이터
├── content/
│   └── reports/                # 각 리포트별 독립 HTML 템플릿 파일
│       ├── fx-intervention.html
│       ├── macro-2026-06-28.html
│       ├── ionq-joby.html
│       ├── nvidia-quantum.html
│       └── ionq-financial-valuation.html
└── source/                     # (기존 원본 리소스 백업)
```

---

## 4. 모듈별 세부 역할 및 구현 설계 (Detailed Design)

### 4.1 `index.html` (App Shell)
- 헤더, 사이드바 메뉴, 모바일 탭 바, 메인 콘텐츠 영역 (`#main-content`)의 기본 DOM skeleton만 유지.
- external CSS (`css/variables.css`, `css/styles.css`) 및 external JS (`js/app.js`)만 참조.

### 4.2 데이터 분리 (`data/`)
- `data/posts.json`: 기존 `POSTS_DATABASE` 배열을 전량 extraction하여 JSON 객체화.
- `data/etf_master.json`: 기존 `ETF_MASTER_DB` 객체를 extraction.

### 4.3 콘텐츠 분리 (`content/reports/`)
- `renderMacroReport`, `renderNvidiaQuantumReport` 등 `index.html` 내부 3,000여 줄에 달하는 template literal HTML 문자열을 개별 `.html` 파일로 분리 추출.
- `report-loader.js`가 요청된 리포트 ID에 해당하는 `content/reports/{id}.html`을 `fetch()`하여 `#main-content`에 주입하고 수식(MathJax) 및 차트(Chart.js)를 후처리 재초기화.

### 4.4 JavaScript Architecture (`js/`)
- **`store.js`**: `data/posts.json` 및 `data/etf_master.json` 비동기 로딩, 검색/카테고리/정렬 필터링 상태 제공.
- **`ui.js`**: 사이드바 개폐, 모바일 Drawer 제어, 테마 적용, 카테고리 전환.
- **`app.js`**: 애플리케이션 초기화(`onload`), 이벤트 수신기 등록.

---

## 5. 단계별 실행 계획 (Implementation Steps)

1. **1단계: 디렉토리 구조 생성 및 CSS/데이터 추출**
   - `css/`, `js/`, `data/`, `content/reports/` 폴더 생성.
   - `index.html` 내 CSS style 태그 내용을 `css/variables.css`, `css/styles.css`로 추출.
   - JSON 데이터 (`POSTS_DATABASE`, `ETF_MASTER_DB`) 추출 및 저장.

2. **2단계: 리포트 HTML 콘텐츠 개별 파일 분리**
   - JS 렌더러 함수 내의 HTML 코드를 `content/reports/` 폴더의 HTML 파일들로 분리 저장.

3. **3단계: JavaScript 모듈 작성 및 비동기 로더 구현**
   - `store.js`, `ui.js`, `report-loader.js`, `app.js` 생성 및 연결.

4. **4단계: `index.html` 슬림화 및 리팩토링 검증**
   - `index.html`을 슬림한 App Shell 코드로 전면 개편.
   - 모바일/데스크톱 UI 동작, 리포트 전환, 검색, 수식(MathJax) 렌더링 정상 검증.

---

## 6. 검증 계획 (Verification Plan)

- **기능 검증**:
  - 카테고리 전환(거시금융/테크·ETF/백과·에세이) 동작 확인.
  - 리포트 선택 시 `content/reports/*.html` 정상 비동기 로드 및 MathJax 수식 렌더링 확인.
  - 모바일 Drawer 및 탭 바 클릭 반응 확인.
- **성능 검증**:
  - `index.html` 용량이 404KB에서 ~15KB로 95% 이상 감소하는지 확인.
