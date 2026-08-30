# MoneyDaddy HTML Architecture Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the 4,165-line monolithic `index.html` into a modular, highly maintainable frontend architecture with decoupled data, content, styles, and scripts.

**Architecture:** Split CSS into `css/`, static JSON databases into `data/`, individual report HTML templates into `content/reports/`, and application logic into ES modules in `js/`. The main `index.html` will serve purely as a lightweight App Shell (~200 lines).

**Tech Stack:** Vanilla JavaScript (ES6+), HTML5, CSS3, MathJax 3, Chart.js, Tailwind CSS CDN (retained for layout compatibility).

## Global Constraints

- Retain existing No-Build / Pure Client-Side Static Web Architecture.
- Maintain full visual design, typography, dark theme variables, and interactive behaviors.
- Ensure all existing reports remain fully readable and interactive with MathJax formula rendering.

---

### Task 1: Style & Token Decoupling

**Files:**
- Create: `css/variables.css`
- Create: `css/styles.css`
- Modify: `index.html`

- [ ] **Step 1: Extract design tokens into `css/variables.css`**
  Copy `:root` variables, fonts, animations, glassmorphism, and color definitions from `index.html` `<style>` block to `css/variables.css`.

- [ ] **Step 2: Extract component & layout styles into `css/styles.css`**
  Move sidebar, post-item, post-card, typography, article-wrap dark overrides, breadcrumb, and mobile table media queries from `index.html` `<style>` to `css/styles.css`.

- [ ] **Step 3: Verify CSS structure**
  Check that `css/variables.css` and `css/styles.css` contain clean, valid CSS syntax.

---

### Task 2: Data Extraction to JSON

**Files:**
- Create: `data/posts.json`
- Create: `data/etf_master.json`

- [ ] **Step 1: Extract `POSTS_DATABASE` to `data/posts.json`**
  Export the full array of post metadata objects from `index.html` into structured JSON in `data/posts.json`.

- [ ] **Step 2: Extract `ETF_MASTER_DB` to `data/etf_master.json`**
  Export the ETF master dictionary from `index.html` into structured JSON in `data/etf_master.json`.

- [ ] **Step 3: Validate JSON formatting**
  Ensure both JSON files are strictly valid according to JSON specifications.

---

### Task 3: Content Decoupling to HTML Templates

**Files:**
- Create: `content/reports/fx-intervention.html`
- Create: `content/reports/macro-2026-06-28.html`
- Create: `content/reports/ionq-joby.html`
- Create: `content/reports/quantum-companies.html`
- Create: `content/reports/skt.html`
- Create: `content/reports/nvidia-quantum.html`
- Create: `content/reports/ionq-financial-valuation.html`
- Create: `content/reports/ionq-achilles.html`
- Create: `content/reports/essay-investing-philosophy.html`

- [ ] **Step 1: Extract `renderFxInterventionReport` content to `content/reports/fx-intervention.html`**
- [ ] **Step 2: Extract `renderMacroReport` content to `content/reports/macro-2026-06-28.html`**
- [ ] **Step 3: Extract `renderIonqJobyReport` content to `content/reports/ionq-joby.html`**
- [ ] **Step 4: Extract `renderQuantumCompaniesReport` content to `content/reports/quantum-companies.html`**
- [ ] **Step 5: Extract `renderSktReport` content to `content/reports/skt.html`**
- [ ] **Step 6: Extract `renderNvidiaQuantumReport` content to `content/reports/nvidia-quantum.html`**
- [ ] **Step 7: Extract `renderIonqFinancialValuationReport` content to `content/reports/ionq-financial-valuation.html`**
- [ ] **Step 8: Extract `renderIonqAchillesReport` content to `content/reports/ionq-achilles.html`**
- [ ] **Step 9: Extract `renderEssayInvestingPhilosophyReport` content to `content/reports/essay-investing-philosophy.html`**

---

### Task 4: JavaScript Architecture & Async Loaders

**Files:**
- Create: `js/store.js`
- Create: `js/ui.js`
- Create: `js/report-loader.js`
- Create: `js/app.js`

- [ ] **Step 1: Create `js/store.js`**
  Implement async loading of `data/posts.json` & `data/etf_master.json`, category filtering, search, and sorting logic.

- [ ] **Step 2: Create `js/ui.js`**
  Implement sidebar toggling, mobile menu drawer interactions, active tab highlight, theme updates.

- [ ] **Step 3: Create `js/report-loader.js`**
  Implement `loadReport(reportId)` to fetch corresponding HTML from `content/reports/`, inject into `#main-content`, and trigger `MathJax.typesetPromise()`.

- [ ] **Step 4: Create `js/app.js`**
  Initialize `store`, setup event listeners, load initial home/category views.

---

### Task 5: App Shell Refactoring & Final Verification

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Refactor `index.html` to App Shell**
  Remove inline `<style>` and inline `<script>` bodies. Link external CSS (`css/variables.css`, `css/styles.css`) and JS (`js/app.js`). Retain HTML structure for header, sidebar drawer, mobile navigation, and `#main-content`.

- [ ] **Step 2: Verify application functionality**
  Open `index.html` in browser, verify sidebar list rendering, category filtering, report asynchronous loading, mobile navigation, and MathJax rendering.
