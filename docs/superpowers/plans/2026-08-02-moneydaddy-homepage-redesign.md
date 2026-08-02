# MoneyDaddy Insight Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 미국 매크로, 전장 표준 기술, 일상 에세이의 3대 카테고리를 제공하는 반응형 다크 테마 기반 프리미엄 웹 포털로 MoneyDaddy Insight 홈페이지를 전면 리팩토링하고, 비즈니스 확장성 표시 장치(페이월, B2B, API)를 탑재합니다.

**Architecture:** 단일 페이지 애플리케이션(SPA) 구조로 자바스크립트 상태(`activeCategory`)를 통해 템플릿 영역을 동적으로 갈아끼우며, 모바일 한 손 조작용 하단 탭 바와 데스크톱용 좌측 사이드바가 전환되는 반응형 그리드를 구축합니다.

**Tech Stack:** Tailwind CSS (CDN), Chart.js (CDN), Vanilla HTML/JS

## Global Constraints
* 기본 테마: Slate (Dark Slate/Navy) 다크 모드 적용 (`bg-slate-900`, `text-slate-300`)
* 카테고리별 세부 톤: 매크로(Emerald Green), 전장(Indigo), 에세이(Warm Amber)
* 타이포그래피: UI 및 기술은 `Plus Jakarta Sans` (Sans-serif), 에세이 본문은 `Lora` (Serif)
* 모바일 해상도(`lg` 미만): 하단 내비게이션 바 필수 활성화
* 깃허브 페이지 호환성 유지: 정적 SPA HTML/JS 방식 유지

---

### Task 1: 듀얼 타이포그래피 폰트 로드 및 테마 베이스 스타일링

**Files:**
- Modify: `D:\01_formyself\MoneyDaddy\index.html:1-60`

**Interfaces:**
- Consumes: 기존 `index.html` 파일 구조
- Produces: `Plus Jakarta Sans` 및 `Lora` 폰트가 탑재되고, 바디에 다크 테마 배경색이 반영된 기본 구조

- [ ] **Step 1: index.html 헤더 영역 폰트 링크 추가**
  기존 Noto Sans KR 폰트 링크 아래에 Google Fonts의 Plus Jakarta Sans와 Lora 링크를 추가합니다.
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
  ```

- [ ] **Step 2: 기본 스타일시트 초기화**
  `<style>` 태그 내부의 body 기본 폰트 패밀리 지정 및 스크롤바 커스텀 스타일을 다크 모드 색상(`bg-slate-900`)에 매칭되도록 업데이트합니다.
  ```css
  body { font-family: 'Plus Jakarta Sans', 'Noto Sans KR', sans-serif; background-color: #0f172a; color: #cbd5e1; }
  .font-serif-essay { font-family: 'Lora', serif; }
  ```

- [ ] **Step 3: 브라우저 실행을 통한 폰트 및 바디 배경색 로드 확인**
  브라우저를 통해 `index.html` 파일을 열고, 배경이 어두운 Slate 색상으로 채워지며 에러 없이 폰트가 렌더링되는지 눈으로 확인합니다.

- [ ] **Step 4: 변경 사항 커밋**
  ```bash
  git add index.html
  git commit -m "style: load dual fonts and apply dark slate base theme"
  ```

---

### Task 2: 모바일 하단 탭 바 및 반응형 사이드바 레이아웃 구축

**Files:**
- Modify: `D:\01_formyself\MoneyDaddy\index.html:60-112`

**Interfaces:**
- Consumes: Task 1의 기본 다크 모드 레이아웃
- Produces: 모바일 환경(`lg` 미만)에서는 하단 탭 바 노출, 데스크톱(`lg` 이상)에서는 고정 사이드바 노출 구조

- [ ] **Step 1: 모바일 하단 고정 탭 바 마크업 추가**
  `<body>` 끝부분 직전에 모바일 화면에서만 보일 하단 고정 내비게이션 바를 추가합니다.
  ```html
  <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-slate-900/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center px-4">
      <button onclick="switchCategory('macro')" class="nav-tab-btn flex flex-col items-center justify-center text-emerald-400">
          <span class="text-xs font-semibold">매크로/종목</span>
      </button>
      <button onclick="switchCategory('tech')" class="nav-tab-btn flex flex-col items-center justify-center text-slate-400">
          <span class="text-xs font-semibold">전장 표준</span>
      </button>
      <button onclick="switchCategory('essay')" class="nav-tab-btn flex flex-col items-center justify-center text-slate-400">
          <span class="text-xs font-semibold">생각/에세이</span>
      </button>
  </nav>
  ```

- [ ] **Step 2: 데스크톱 사이드바 마크업 수정**
  기존 `<aside id="sidebar">`의 구조를 다크 슬레이트와 투명 경계선(`border-white/10`)으로 리스타일링합니다.
  ```html
  <aside id="sidebar" class="hidden lg:flex lg:sidebar-fixed-width flex-col h-screen border-r border-white/10 bg-slate-900">
      <!-- 로고 및 상단 헤더 -->
      <!-- 세 가지 카테고리 전환 메뉴 리스트 -->
  </aside>
  ```

- [ ] **Step 3: 브라우저 창 크기를 늘리거나 줄이며 드롭 확인**
  개발자 도구를 켜서 가로 해상도가 1024px 미만일 때 데스크톱 사이드바가 가려지고 하단 탭 바가 완벽하게 노출되는지 점검합니다.

- [ ] **Step 4: 변경 사항 커밋**
  ```bash
  git add index.html
  git commit -m "layout: implement responsive mobile bottom tab bar and sidebar layout"
  ```

---

### Task 3: 카테고리 상태 관리 및 테마 크로스페이드 트랜지션 구현

**Files:**
- Modify: `D:\01_formyself\MoneyDaddy\index.html` (Script 영역)

**Interfaces:**
- Consumes: Task 2의 HTML 내비게이션 탭 요소들
- Produces: `switchCategory(category)` 자바스크립트 함수 및 카테고리에 맞는 포인트 컬러 스타일 트랜지션 처리기

- [ ] **Step 1: 카테고리 상태 및 렌더링 제어 함수 작성**
  자바스크립트 데이터 섹션 뒤에 선택된 카테고리를 기록하고 본문 컨테이너 및 탭 바의 스타일을 크로스페이드 시키는 `switchCategory` 함수를 선언합니다.
  ```javascript
  let activeCategory = 'macro'; // 'macro', 'tech', 'essay'

  function switchCategory(category) {
      activeCategory = category;
      
      // 모든 내비게이션 버튼 비활성화 스타일 적용 후, 선택된 것만 하이라이트
      document.querySelectorAll('.nav-tab-btn').forEach(btn => {
          btn.classList.replace('text-emerald-400', 'text-slate-400');
          btn.classList.replace('text-indigo-400', 'text-slate-400');
          btn.classList.replace('text-amber-400', 'text-slate-400');
      });

      // 바디 포인트 컬러에 맞춰 트랜지션 처리 및 템플릿 렌더링 호출
      renderMainContent();
  }
  ```

- [ ] **Step 2: 템플릿 렌더링 게이트웨이 구현**
  본문 영역(`id="main-content"`)에 선택된 카테고리에 따라 다른 구조의 마크업을 바인딩하는 `renderMainContent()` 스켈레톤을 구현합니다.
  ```javascript
  function renderMainContent() {
      const container = document.getElementById('main-content');
      if (activeCategory === 'macro') {
          container.innerHTML = `<div class="p-6 transition-opacity duration-300">매크로 데이터 & 차트 대시보드 뷰</div>`;
      } else if (activeCategory === 'tech') {
          container.innerHTML = `<div class="p-6 transition-opacity duration-300">전장시스템 표준 문서 리스트 및 분석 뷰</div>`;
      } else if (activeCategory === 'essay') {
          container.innerHTML = `<div class="p-6 transition-opacity duration-300 font-serif-essay">머니대디 감성 에세이 에디터/본문 뷰</div>`;
      }
  }
  ```

- [ ] **Step 3: 탭 클릭 테스트**
  각 메뉴 클릭 시 `main-content` 영역의 텍스트가 깜빡임 없이 즉시 전환되는지 브라우저에서 직접 테스트합니다.

- [ ] **Step 4: 변경 사항 커밋**
  ```bash
  git add index.html
  git commit -m "feat: implement category state manager and template router"
  ```

---

### Task 4: 프리미엄 UX 컴포넌트 고도화 (페이월, B2B 솔루션, API 안내)

**Files:**
- Modify: `D:\01_formyself\MoneyDaddy\index.html`

**Interfaces:**
- Consumes: Task 3의 템플릿 동적 렌더링 및 UI 스키마
- Produces: 아티클 템플릿 내 페이월 블러 처리 컴포넌트, B2B 제휴 다이얼로그 모달, API 데이터 게이트 노출

- [ ] **Step 1: 아티클 상세 본문 컴포넌트에 페이월(Paywall) 구현**
  에세이 및 특정 매크로 리포트 렌더링 시 본문 하단 50% 지점에 블러 그라데이션 필터와 결제 안내 모달 마크업을 바인딩합니다.
  ```html
  <div class="relative mt-8 h-48 bg-gradient-to-t from-slate-900 to-transparent flex flex-col items-center justify-end pb-4">
      <div class="absolute inset-0 backdrop-blur-[2px] bg-slate-900/40 pointer-events-none"></div>
      <div class="relative z-10 text-center px-4">
          <p class="text-sm font-semibold text-amber-400 mb-2">🔒 Premium Insight Limit</p>
          <p class="text-xs text-slate-400 mb-3">본 리포트의 결론 및 상세 대응 전략은 Pro 멤버십 회원 전용입니다.</p>
          <button class="px-4 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-bold rounded-lg transition-all shadow-lg">멤버십 가입하고 잠금 해제</button>
      </div>
  </div>
  ```

- [ ] **Step 2: B2B Solutions 문의 모달 시스템 연동**
  자문 및 컨설팅 링크를 눌렀을 때 팝업창 형태로 출력될 B2B 접수 문의 모달 컴포넌트를 설계합니다.
  ```html
  <div id="b2b-modal" class="fixed inset-0 z-50 hidden bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
          <h3 class="text-lg font-bold text-slate-100 mb-4">💼 B2B 기술 자문 및 컨설팅 문의</h3>
          <!-- 간이 접수 폼 구성 -->
          <button onclick="closeB2BModal()" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg mt-3">닫기</button>
      </div>
  </div>
  ```

- [ ] **Step 3: 데이터 API Access 게이트 추가**
  사이드바 및 모바일 내비게이션 최하단 푸터 영역에 은은하게 활성화된 `[API Access]` 링크 카드를 생성합니다. 클릭 시 "Coming Soon: 머니대디 인사이트 데이터 API 베타 서비스 준비 중" 팝업 알림을 띄웁니다.

- [ ] **Step 4: 로컬 서빙 및 시각적/동작 확인**
  브라우저를 열고, 각 탭이 완벽히 변환되는지, 페이월이 잘 렌더링되는지, B2B 모달이 정상 팝업되는지 점검합니다.

- [ ] **Step 5: 변경 사항 커밋**
  ```bash
  git add index.html
  git commit -m "feat: integrate paywall, B2B modal, and API status indicator"
  ```

---

### Task 5: 콘텐츠 동적 데이터 분리(JSON) 및 일간 업데이트 알림 UI 구축

**Files:**
- Create: `D:\01_formyself\MoneyDaddy\source\posts.json`
- Modify: `D:\01_formyself\MoneyDaddy\index.html` (JS 로딩 및 UI 구성 부문)

**Interfaces:**
- Consumes: Task 4까지 리팩토링된 정적 HTML 구조
- Produces: 관리자가 JSON 파일만 수정해 새 글을 추가하는 동적 데이터베이스 환경 및 사용자용 "최신 업데이트 알림 배너/티커"

- [ ] **Step 1: 아티클 데이터베이스 JSON 분리**
  기존 `POSTS_DATABASE` 자바스크립트 객체 배열을 `source/posts.json` 파일로 신규 분리합니다.
  ```json
  [
      { "id": "macro-2026-06-28", "category": "📰 데일리", "title": "[2026.06.28] 2026 글로벌 거시금융 환경 전망", "date": "2026.06.28", "type": "macro" }
  ]
  ```

- [ ] **Step 2: index.html에서 JSON 비동기 로드 및 바인딩 구현**
  HTML이 로드될 때 `fetch('source/posts.json')`를 통해 콘텐츠 데이터를 동적으로 불러오도록 자바스크립트를 수정합니다.
  ```javascript
  let POSTS_DATABASE = [];
  async function loadPostsData() {
      try {
          const response = await fetch('source/posts.json');
          POSTS_DATABASE = await response.json();
          renderMainContent();
      } catch (err) {
          console.error("콘텐츠 DB 로딩 실패:", err);
      }
  }
  window.onload = loadPostsData;
  ```

- [ ] **Step 3: "오늘의 신규 인사이트" 일간 알림 UI 구현**
  메인 화면 최상단에 오늘 날짜 기준으로 작성된 최신 글이 있을 경우 활성화되는 **"🔥 Today's Update"** 네온 알림 티커 배너를 추가합니다.
  ```html
  <div id="today-update-banner" class="bg-gradient-to-r from-emerald-950 to-indigo-950 border border-emerald-500/30 px-4 py-2 rounded-xl mb-6 flex items-center justify-between">
      <span class="text-xs font-bold text-emerald-400">🔥 오늘의 신규 인사이트가 업데이트되었습니다.</span>
      <span class="text-[10px] text-slate-400">자세히 보기 &rarr;</span>
  </div>
  ```

- [ ] **Step 4: 로컬 웹서버 실행을 통한 동작 검증**
  로컬에서 간단히 웹서버를 띄워 (예: `python -m http.server`), `fetch` 요청이 CORS 에러 없이 정상적으로 JSON 파일을 가져와 본문을 동적 렌더링하는지 확인합니다.

- [ ] **Step 5: 변경 사항 커밋**
  ```bash
  git add source/posts.json index.html
  git commit -m "feat: split posts DB to external JSON and implement liveness ticker UI"
  ```

