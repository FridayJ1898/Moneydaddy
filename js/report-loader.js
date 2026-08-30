/**
 * MoneyDaddy - Dynamic Report Loader & Chart Initializer (js/report-loader.js)
 * 리포트 템플릿 비동기 로딩, MathJax 수식 렌더링, Chart.js 차트 초기화 및 인터랙티브 뷰 처리
 */


// 차트 인스턴스 보관소 (Canvas 재사용 시 destroy 관리)
const chartInstances = {};

function destroyChart(id) {
    if (chartInstances[id]) {
        try {
            chartInstances[id].destroy();
        } catch (e) {
            console.warn(`Chart destroy failed for ${id}:`, e);
        }
        delete chartInstances[id];
    }
}

/**
 * 포스트 메타데이터를 기반으로 템플릿 파일 경로를 반환
 */
function getTemplateUrl(post) {
    const typeMap = {
        'ionq-financial-valuation': 'content/reports/ionq-financial-valuation.html',
        'nvidia-quantum': 'content/reports/nvidia-quantum.html',
        'ionq-achilles': 'content/reports/ionq-achilles.html',
        'fx-intervention': 'content/reports/fx-intervention.html',
        'ionq-joby': 'content/reports/ionq-joby.html',
        'quantum-report': 'content/reports/quantum-companies.html',
        'quick-tip': 'content/reports/quick-tip.html',
        'macro': 'content/reports/macro-2026-06-28.html',
        'daily': 'content/reports/daily-2026-06-02.html',
        'skt': 'content/reports/skt.html',
        'report': 'content/reports/ai-infra-2026-full.html'
    };

    if (typeMap[post.type]) {
        return typeMap[post.type];
    }

    if (post.type === 'essay') {
        if (post.id && post.id.includes('mistakes')) {
            return 'content/reports/essay-etf-mistakes.html';
        }
        return 'content/reports/essay-investing-philosophy.html';
    }

    // ID 기반 폴백
    if (post.id === 'quantum-companies-2026-08-02') return 'content/reports/quantum-companies.html';
    if (post.id === 'macro-2026-06-28') return 'content/reports/macro-2026-06-28.html';
    if (post.id === 'daily-2026-06-02') return 'content/reports/daily-2026-06-02.html';
    if (post.id === 'skt-2026-06-02') return 'content/reports/skt.html';
    if (post.id === 'ai-infra-2026-full') return 'content/reports/ai-infra-2026-full.html';

    return null;
}

/**
 * 포스트 상세 리포트 로드 및 렌더링
 */
async function loadPost(id, forceShow = false) {
    const post = store.getPostById(id);
    if (!post) {
        console.warn(`Post not found for id: ${id}`);
        return;
    }

    // 1. 데일리/리포트 관련 2단계 탐색 (훑어보기 후 진입)
    if ((post.type === 'macro' || post.type === 'daily' || post.type === 'quick-tip') && !forceShow) {
        if (!store.selectedDailyPulsePost || store.selectedDailyPulsePost.id !== id) {
            store.selectedDailyPulsePost = post;
            store.currentPostId = id;
            switchCategory('macro');
            closeDrawer();
            
            // 화면 상단 알림 토스트 효과
            const alertEl = document.createElement('div');
            alertEl.className = 'fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg shadow-lg text-xs fade-in';
            alertEl.innerHTML = `💡 오늘의 한마디에 "${post.category}" 데이터가 연동되었습니다!`;
            document.body.appendChild(alertEl);
            setTimeout(() => alertEl.remove(), 2500);
            return;
        }
    }

    store.currentPostId = id;
    store.selectedDailyPulsePost = post;
    renderSidebar();

    // 2. 카테고리 자동 연동 및 탭 스타일 동기화
    const postCategory = store.getCategoryForPost(post);
    store.activeCategory = postCategory;
    const theme = CATEGORY_THEMES[postCategory] || CATEGORY_THEMES.all;
    applyTheme(theme.color);

    document.querySelectorAll('.mob-tab').forEach(b => {
        const active = b.id === `mob-tab-${postCategory}`;
        b.style.color = active ? theme.color : '';
    });
    document.querySelectorAll('.cat-tab').forEach(b => {
        const active = b.dataset.category === postCategory;
        b.classList.toggle('text-white', active);
        b.classList.toggle('bg-white/10', active);
        b.classList.toggle('text-slate-500', !active);
    });

    // 3. 메인 컨테이너 초기화 및 래퍼 생성
    const container = document.getElementById('main-content');
    if (!container) return;
    container.innerHTML = '';

    // 브레드크럼 헤더
    // 브레드크럼 및 독서 컨트롤 툴바
    const catLabel = theme.label;
    const bc = document.createElement('div');
    bc.className = 'breadcrumb-bar';
    bc.innerHTML = `
        <button class="back-btn" onclick="window.switchCategory('${postCategory}')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
            ${catLabel} 목록
        </button>
        <div class="flex items-center gap-2">
            <div class="reader-toolbar">
                <span class="text-[10px] text-slate-400 font-bold px-1">글자크기</span>
                <button class="reader-btn" onclick="window.changeArticleFontSize(-1)" title="글자 축소">A-</button>
                <button class="reader-btn" onclick="window.changeArticleFontSize(1)" title="글자 확대">A+</button>
            </div>
            <span class="post-cat">${post.category}</span>
        </div>
    `;
    container.appendChild(bc);

    // 콘텐츠 래퍼
    const wrapper = document.createElement('div');
    wrapper.className = 'fade-in article-wrap';

    // 로컬 조회수 증가
    store.incrementViews(post.id);

    // 4. 콘텐츠 주입 (인터랙티브 ETF 대시보드 / 백과사전 / HTML 템플릿 비동기 로딩)
    if (post.type === 'interactive' || post.type === 'finance-etf') {
        renderInteractiveDashboard(wrapper, post);
    } else if (post.type === 'dictionary') {
        renderDictionary(wrapper);
    } else {
        const templateUrl = getTemplateUrl(post);
        if (templateUrl) {
            let loadedHtml = null;
            try {
                const res = await fetch(templateUrl);
                if (res.ok) {
                    loadedHtml = await res.text();
                }
            } catch (err) {
                console.warn(`fetch failed for ${templateUrl}, using embedded template fallback:`, err);
            }

            // fetch 실패 시 (file:// 환경 등) 내장 템플릿에서 복구
            if (!loadedHtml && window.REPORT_TEMPLATES && window.REPORT_TEMPLATES[templateUrl]) {
                loadedHtml = window.REPORT_TEMPLATES[templateUrl];
            }

            if (loadedHtml) {
                wrapper.innerHTML = loadedHtml;
            } else {
                wrapper.innerHTML = `<div class="p-8 text-center text-slate-400"><p>리포트 템플릿 준비 중입니다.</p></div>`;
            }
        }
    }

    // 5. 인터랙션 액션 바 (북마크/공유/조회자수)
    const ab = document.createElement('div');
    ab.className = 'max-w-[860px] mx-auto px-6 py-6 mt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 bg-white/[0.01] rounded-xl';
    const cleanTitle = (post.title || '').replace(/<[^>]*>?/gm, '');
    const escapedTitle = cleanTitle.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    ab.innerHTML = `
        <div class="flex items-center gap-3">
            <button onclick="window.toggleBookmark('${post.id}')" id="btn-bm-${post.id}" class="flex items-center gap-1.5 py-1.5 px-3 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all">📌 북마크</button>
            <button onclick="window.sharePost('${escapedTitle}')" class="flex items-center gap-1.5 py-1.5 px-3 rounded bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-all">🔗 공유하기</button>
        </div>
        <div class="flex items-center gap-4 text-[11px] text-slate-500">
            <span>이 글을 <b class="text-slate-300">${post.views || 450}명</b>이 함께 읽었습니다.</span>
            <span>평균 독서 시간: <b class="text-slate-300">${post.readTime || '5분'}</b></span>
        </div>
    `;
    wrapper.appendChild(ab);

    container.appendChild(wrapper);

    // 7. 다크 오버라이드 렌더링
    requestAnimationFrame(() => applyDarkOverride(wrapper));

    // 8. MathJax 수식 렌더링 트리거
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        setTimeout(() => {
            window.MathJax.typesetPromise();
        }, 80);
    }

    // 9. 리포트별 차트 초기화 트리거
    setTimeout(() => {
        if (post.type === 'skt') {
            initSktCharts();
        } else if (post.type === 'daily') {
            initDailyCharts();
        } else if (post.type === 'ionq-joby') {
            initIonqJobyCharts();
        } else if (post.type === 'quantum-report') {
            initQuantumCharts();
        }
    }, 120);

    container.scrollTop = 0;
}

/**
 * 인터랙티브 ETF 대시보드 렌더링
 */
function renderInteractiveDashboard(container, post) {
    const categories = {
        finance: ['XLF', 'KBE', 'KRE'],
        quantum: ['QTUM', 'TEKZ', 'LOUP'],
        data: ['DTCR', 'SRVR', 'IDGT'],
        power: ['GRID', 'PAVE', 'XLU']
    };
    const key = post.categoryKey || 'finance';
    const tickers = categories[key] || ['XLF', 'KBE', 'KRE'];
    const themeColor = key === 'power' ? 'indigo' : (key === 'data' ? 'blue' : (key === 'quantum' ? 'purple' : 'slate'));

    container.innerHTML = `
        <div class="bg-${themeColor}-950 text-white p-8 md:p-20">
            <div class="max-w-4xl mx-auto">
                <span class="text-${themeColor}-400 font-bold text-[10px] tracking-widest uppercase">${post.category} | ${post.date}</span>
                <h1 class="text-2xl md:text-4xl font-black mt-3 mb-4">${post.title}</h1>
                <p class="text-slate-300 text-sm md:text-lg opacity-80 leading-relaxed">데이터 기반 종목별 실시간 분석 리포트입니다.</p>
            </div>
        </div>
        <div class="max-w-6xl mx-auto px-4 py-8">
            <div class="bg-white p-4 md:p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
                <h4 class="font-bold mb-6 text-sm uppercase tracking-widest text-center text-slate-500 underline underline-offset-8">상대 수익률 시뮬레이션</h4>
                <div class="chart-container" style="height:260px;position:relative;"><canvas id="lineChartCanvas"></canvas></div>
            </div>
            <div class="flex flex-col lg:flex-row gap-6">
                <div class="grid grid-cols-3 lg:grid-cols-1 lg:w-48 gap-3 shrink-0">
                    ${tickers.map(t => `<button onclick="window.updateData('${t}')" class="w-full p-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 font-bold text-slate-700 text-xs md:text-base transition-all">${t}</button>`).join('')}
                </div>
                <div class="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 class="text-xs font-bold text-slate-400 mb-4 uppercase">핵심 지표 요약</h4>
                        <table class="w-full text-xs"><tbody id="summary-table" class="divide-y divide-slate-100"></tbody></table>
                    </div>
                    <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
                        <h4 class="text-xs font-bold text-slate-400 mb-4 uppercase">자산 배분 구조</h4>
                        <div class="chart-container" style="height:220px;position:relative;width:100%;"><canvas id="donutChartCanvas"></canvas></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        initLineChart(tickers);
        updateData(tickers[0]);
    }, 80);
}

/**
 * ETF 백과사전 렌더링
 */
function renderDictionary(container) {
    const db = store.ETF_MASTER_DB;
    container.innerHTML = `
        <div class="bg-blue-900 text-white p-10 md:p-20 text-center">
            <h1 class="text-3xl md:text-5xl font-black mb-4">ETF 백과사전</h1>
            <p class="text-blue-100 text-sm md:text-lg">조사된 12종의 핵심 ETF 바이블</p>
        </div>
        <div class="max-w-5xl mx-auto px-4 py-12 space-y-6">
            ${Object.keys(db).map(ticker => {
                const data = db[ticker];
                return `
                <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 dictionary-card">
                    <div class="flex flex-col md:flex-row justify-between gap-4 mb-4">
                        <div><span class="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase mb-1 inline-block">${ticker}</span><h3 class="text-xl font-bold text-slate-800">${data.title}</h3></div>
                        <div class="flex gap-4 text-[11px] font-bold text-slate-400"><div>보수<br><span class="text-slate-900 text-base font-bold">${data.fee}</span></div><div>배당<br><span class="text-blue-600 text-base font-bold">${data.yield}</span></div></div>
                    </div>
                    <div class="bg-slate-50 p-5 rounded-xl text-slate-700 text-xs md:text-sm leading-relaxed border border-slate-100">
                        <p class="font-bold text-blue-900 mb-1">"${data.summary}"</p>
                        <p>${data.details}</p>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
}

// ── 공통 ETF 인터랙티브 차트 함수 ──
function initLineChart(tickers) {
    const canvas = document.getElementById('lineChartCanvas');
    if (!canvas) return;
    destroyChart('lineChartCanvas');
    const ctx = canvas.getContext('2d');
    const colors = ['#1d4ed8', '#059669', '#d97706', '#4f46e5'];
    
    chartInstances['lineChartCanvas'] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Start', 'Yr1', 'Yr2', 'Yr3', 'Now'],
            datasets: tickers.map((t, i) => ({
                label: t,
                data: [100, 105 + (i * 4), 115 - (i * 2), 140 + (i * 7), 160 + (i * 10)],
                borderColor: colors[i % colors.length],
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 2
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
            }
        }
    });
}

function updateData(ticker) {
    const data = store.ETF_MASTER_DB[ticker];
    if (!data) return;

    const summaryTable = document.getElementById('summary-table');
    if (summaryTable) {
        summaryTable.innerHTML = `
            <tr><td class="py-3 text-slate-500">종목</td><td class="py-3 text-right font-black text-slate-900">${ticker}</td></tr>
            <tr><td class="py-3 text-slate-500">추종지수</td><td class="py-3 text-right font-bold text-xs truncate max-w-[140px]">${data.index}</td></tr>
            <tr><td class="py-3 text-slate-500">보수/배당</td><td class="py-3 text-right font-bold text-blue-600">${data.fee} / ${data.yield}</td></tr>
            <tr><td class="py-4 font-bold text-slate-900 italic text-sm" colspan="2">"${data.summary}"</td></tr>
            <tr><td class="py-2 text-slate-500 text-[11px] leading-normal" colspan="2">${data.details}</td></tr>
        `;
    }

    const donutCanvas = document.getElementById('donutChartCanvas');
    if (donutCanvas) {
        destroyChart('donutChartCanvas');
        const ctx = donutCanvas.getContext('2d');
        chartInstances['donutChartCanvas'] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Core', 'Others', 'Cash'],
                datasets: [{
                    data: [70, 20, 10],
                    backgroundColor: [data.color, data.color + '99', data.color + '33'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 8, font: { size: 9 } } }
                }
            }
        });
    }
}

// ── SKT 리포트 차트 초기화 ──
function initSktCharts() {
    const earCtx = document.getElementById('sktEarningsChart');
    if (earCtx) {
        destroyChart('sktEarningsChart');
        chartInstances['sktEarningsChart'] = new Chart(earCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1'],
                datasets: [{
                    label: '영업이익 (억 원)',
                    data: [5100, 4800, 3200, 1191, 5376],
                    backgroundColor: ['#94a3b8', '#94a3b8', '#94a3b8', '#f87171', '#f59e0b'],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => ` 영업이익: ${ctx.parsed.y.toLocaleString()}억 원` } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => v.toLocaleString() + '억' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const revCtx = document.getElementById('sktRevenueChart');
    if (revCtx) {
        destroyChart('sktRevenueChart');
        chartInstances['sktRevenueChart'] = new Chart(revCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['유무선 통신 (MNO)', 'AIDC / GPUaaS', 'SK브로드밴드', '미디어·구독·기타'],
                datasets: [{
                    data: [58, 8, 26, 8],
                    backgroundColor: ['#1d4ed8', '#f59e0b', '#10b981', '#94a3b8'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 }, padding: 14 } },
                    tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
                }
            }
        });
    }

    const anthCtx = document.getElementById('anthropicChart');
    if (anthCtx) {
        destroyChart('anthropicChart');
        chartInstances['anthropicChart'] = new Chart(anthCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['투자 시점\n(2023.08)', '시리즈B\n(2024.01)', '구글·아마존\n추가 투자', '2025 말', 'pre-IPO\n(2026 Q1)', 'IPO 예상\n(2026 Q4)'],
                datasets: [
                    {
                        label: '앤트로픽 기업가치 (억 달러)',
                        data: [50, 180, 650, 1800, 3600, 5000],
                        borderColor: '#7c3aed',
                        backgroundColor: 'rgba(124,58,237,0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 5,
                        yAxisID: 'y'
                    },
                    {
                        label: 'SKT 지분 평가액 (억 원)',
                        data: [1300, 3500, 7000, 12000, 28000, 40000],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.06)',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 2,
                        borderDash: [6, 3],
                        pointRadius: 5,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { type: 'linear', position: 'left', grid: { color: 'rgba(0,0,0,0.05)' }, title: { display: true, text: '기업가치 (억$)' } },
                    y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'SKT 지분 평가 (억원)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const starCtx = document.getElementById('sktStarlinkChart');
    if (starCtx) {
        destroyChart('sktStarlinkChart');
        chartInstances['sktStarlinkChart'] = new Chart(starCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['기존 지상망\n(도심)', '기존 지상망\n(해상·오지)', '스타링크\n단독', 'SK텔링크\n하이브리드'],
                datasets: [{
                    label: '커버리지 및 서비스 효율 지수',
                    data: [95, 10, 82, 96],
                    backgroundColor: ['#64748b', '#cbd5e1', '#ef4444', '#3b82f6'],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: ctx => ` 효율 지수: ${ctx.parsed.y}점` } }
                },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { callback: v => v + '점' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

// ── 데일리 리포트 차트 초기화 ──
function initDailyCharts() {
    const kCtx = document.getElementById('kShapeChart');
    if (kCtx) {
        destroyChart('kShapeChart');
        chartInstances['kShapeChart'] = new Chart(kCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['2024 Q4', '2025 Q1', '2025 Q2', '2025 Q3', '2025 Q4', '2026 Q1', '2026 Q2*'],
                datasets: [
                    {
                        label: '📈 S&P500 수익률 (누적, 기준=100)',
                        data: [100, 108, 115, 121, 130, 142, 123],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16,185,129,0.08)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 4
                    },
                    {
                        label: '🛒 소비자 물가 지수 (CPI, 기준=100)',
                        data: [100, 101, 102.5, 103.8, 104.5, 105.9, 107.2],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245,158,11,0.05)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 2,
                        borderDash: [5, 3],
                        pointRadius: 4
                    },
                    {
                        label: '😟 소비자 심리지수 (기준=100)',
                        data: [100, 97, 94, 91, 88, 84, 82],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239,68,68,0.05)',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { beginAtZero: false, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    const fomcCtx = document.getElementById('fomcChart');
    if (fomcCtx) {
        destroyChart('fomcChart');
        chartInstances['fomcChart'] = new Chart(fomcCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['금리 동결 (A)', '동결+매파 발언 (B)', '금리 인상 (C)'],
                datasets: [{
                    data: [50, 38, 12],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '65%',
                plugins: {
                    legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 }, padding: 16 } },
                    tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}% 확률` } }
                }
            }
        });
    }

    const aiCtx = document.getElementById('aiPerformanceChart');
    if (aiCtx) {
        destroyChart('aiPerformanceChart');
        chartInstances['aiPerformanceChart'] = new Chart(aiCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['DTCR\n데이터 인프라', 'GRID\n전력 인프라', 'QTUM\n양자컴퓨팅', 'PAVE\n건설 인프라', 'SRVR\n데이터 리츠', 'XLU\n유틸리티', 'S&P500\n전체 지수'],
                datasets: [{
                    label: '2026 YTD 수익률 (%)',
                    data: [22.4, 18.7, 16.2, 14.8, 9.3, 11.2, 23.0],
                    backgroundColor: [
                        'rgba(29,78,216,0.85)',
                        'rgba(79,70,229,0.85)',
                        'rgba(124,58,237,0.85)',
                        'rgba(99,102,241,0.85)',
                        'rgba(5,150,105,0.85)',
                        'rgba(168,85,247,0.85)',
                        'rgba(16,185,129,0.85)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: (ctx) => ` YTD: +${ctx.parsed.y}%` } }
                }
            }
        });
    }
}

// ── IonQ Joby 리포트 차트 초기화 ──
function initIonqJobyCharts() {
    const deltaCtx = document.getElementById('deltaUnwindChart');
    if (deltaCtx) {
        destroyChart('deltaUnwindChart');
        chartInstances['deltaUnwindChart'] = new Chart(deltaCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['$44.43(현재)', '$45.00(저항)', '$47.50', '$50.00(임계)', '$55.00(목표)'],
                datasets: [{
                    label: '기관 숏 헤지 누적 공매도량 (주)',
                    data: [8080395, 7616217, 5752193, 4205209, 2061286],
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124,58,237,0.1)',
                    fill: true,
                    tension: 0.35,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#7c3aed'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                    y: { 
                        grid: { color: 'rgba(0,0,0,0.05)' }, 
                        ticks: { 
                            font: { size: 10 },
                            callback: v => (v / 10000) + '만주' 
                        } 
                    },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                }
            }
        });
    }
}

// ── 양자 기업 비교 리포트 차트 초기화 ──
const techCompareData = {
    super: {
        labels: ['속도', '정밀도', '확장성', '인프라 비용', '결맞음 시간'],
        values: [95, 60, 85, 90, 40],
        title: '초전도 (Superconducting)',
        metaphor: '"얼음판 위의 초고속 F1 레이싱"',
        desc: '<p>영하 273도의 극저온에서 전기 저항이 0이 되는 성질을 이용합니다. <strong>IBM, Google</strong>이 주도하고 있습니다.</p><ul class="space-y-2"><li class="flex items-start"><span class="text-blue-500 mr-2">✔</span> 연산 속도가 타 방식 대비 수천 배 빠름</li><li class="flex items-start"><span class="text-blue-500 mr-2">✔</span> 기존 반도체 공정을 활용한 대량 생산 가능</li><li class="flex items-start"><span class="text-red-400 mr-2">✘</span> 외부 소음(열)에 극도로 취약, 거대 냉각기 필수</li></ul>'
    },
    ion: {
        labels: ['속도', '정밀도', '확장성', '인프라 비용', '결맞음 시간'],
        values: [40, 98, 55, 60, 95],
        title: '이온트랩 (Trapped-ion)',
        metaphor: '"진공 속의 정밀 레이저 곡예"',
        desc: '<p>진공 속에 원자를 띄워 레이저로 제어합니다. <strong>IonQ, Quantinuum</strong>이 대표적입니다.</p><ul class="space-y-2"><li class="flex items-start"><span class="text-blue-500 mr-2">✔</span> 99.99%의 압도적 연산 정밀도</li><li class="flex items-start"><span class="text-blue-500 mr-2">✔</span> 상온 진공 챔버 운영 가능 (소형화 유리)</li><li class="flex items-start"><span class="text-red-400 mr-2">✘</span> 연산 속도가 상대적으로 느리고 대규모 병렬화가 어려움</li></ul>'
    },
    neutral: {
        labels: ['속도', '정밀도', '확장성', '인프라 비용', '결맞음 시간'],
        values: [60, 80, 95, 50, 70],
        title: '중성원자/광자 (Neutral/Photonic)',
        metaphor: '"밤하늘의 드론 라이트 쇼"',
        desc: '<p>광학 집게로 원자를 재배열하거나 빛의 입자를 활용합니다. <strong>AWS, QuEra</strong>가 차세대 주자로 꼽힙니다.</p><ul class="space-y-2"><li class="flex items-start"><span class="text-blue-500 mr-2">✔</span> 단일 시스템 내 수천 큐비트 확장 용이</li><li class="flex items-start"><span class="text-blue-500 mr-2">✔</span> 빛의 속도로 연산 및 광랜 통신 연동 가능</li><li class="flex items-start"><span class="text-red-400 mr-2">✘</span> 2큐비트 게이트 연산 제어가 물리적으로 매우 난해함</li></ul>'
    }
};

function updateTechView(key) {
    const data = techCompareData[key];
    if (!data) return;

    const titleEl = document.getElementById('tech-title');
    const metaEl = document.getElementById('tech-metaphor');
    const descEl = document.getElementById('tech-desc');
    
    if (titleEl) titleEl.innerText = data.title;
    if (metaEl) metaEl.innerText = data.metaphor;
    if (descEl) descEl.innerHTML = data.desc;

    if (chartInstances['techCompareChart']) {
        chartInstances['techCompareChart'].data.datasets[0].data = data.values;
        chartInstances['techCompareChart'].update();
    }

    ['super', 'ion', 'neutral'].forEach(k => {
        const btn = document.getElementById(`btn-${k}`);
        if (btn) {
            btn.style.background = k === key ? 'rgba(255,255,255,0.08)' : 'transparent';
            btn.style.fontWeight = k === key ? '700' : '400';
            btn.className = `px-3.5 py-1.5 text-xs rounded-md transition-all ${k === key ? 'text-slate-200' : 'text-slate-400'}`;
        }
    });
}

function initQuantumCharts() {
    const rCtx = document.getElementById('techCompareChart');
    if (rCtx) {
        destroyChart('techCompareChart');
        chartInstances['techCompareChart'] = new Chart(rCtx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: techCompareData.super.labels,
                datasets: [{
                    label: '성능 궤적',
                    data: techCompareData.super.values,
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    borderColor: '#8b5cf6',
                    pointBackgroundColor: '#8b5cf6',
                    borderWidth: 1.5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { display: false, stepSize: 20 },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        angleLines: { color: 'rgba(255,255,255,0.05)' },
                        pointLabels: { color: '#94a3b8', font: { size: 9 } }
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    const ibmCtx = document.getElementById('ibmRatioChart');
    if (ibmCtx) {
        destroyChart('ibmRatioChart');
        chartInstances['ibmRatioChart'] = new Chart(ibmCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['표면 코드(이전)', 'qLDPC(IBM 2026)'],
                datasets: [{
                    data: [1000, 24],
                    backgroundColor: ['rgba(255,255,255,0.15)', '#60a5fa'],
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 9 } } },
                    y: { grid: { display: false }, ticks: { color: '#cbd5e1', font: { size: 9 } } }
                }
            }
        });
    }

    const ionqCtx = document.getElementById('ionqGrowthChart');
    if (ionqCtx) {
        destroyChart('ionqGrowthChart');
        chartInstances['ionqGrowthChart'] = new Chart(ionqCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['23Q1', '24Q1', '25Q1', '26Q1'],
                datasets: [{
                    data: [7.6, 12.1, 24.5, 64.7],
                    borderColor: '#fcd34d',
                    backgroundColor: 'rgba(245, 158, 11, 0.05)',
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 9 } } },
                    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 9 } } }
                }
            }
        });
    }
}


let currentArticleFontSize = 16;

function changeArticleFontSize(delta) {
    currentArticleFontSize = Math.min(22, Math.max(14, currentArticleFontSize + delta));
    const paragraphs = document.querySelectorAll('.article-wrap p, .article-wrap li, .article-wrap td');
    paragraphs.forEach(p => {
        p.style.fontSize = `${currentArticleFontSize}px`;
    });
}

// Global Window Exposure
window.loadPost = loadPost;
window.updateData = updateData;
window.updateTechView = updateTechView;
window.changeArticleFontSize = changeArticleFontSize;
window.updateTechView = updateTechView;
