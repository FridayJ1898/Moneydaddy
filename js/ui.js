/**
 * MoneyDaddy - UI Interaction Controller (js/ui.js)
 * 테마 제어, 네비게이션, 사이드바/모달 렌더링, 페이월 및 인터랙션 핸들러
 */


/**
 * CSS 변수 기반 테마 색상 적용
 */
function applyTheme(color) {
    document.documentElement.style.setProperty('--theme-color', color);
}

/**
 * 홈(전체 카테고리)으로 돌아가기
 */
function goHome() {
    store.selectedDailyPulsePost = null;
    store.currentPostId = '';
    switchCategory('all');
}

/**
 * 상단 Reading Progress Bar 동적 업데이트
 */
function setupScrollProgressBar() {
    const mainEl = document.getElementById('main-content');
    const barEl = document.getElementById('reading-progress-bar');
    if (!mainEl || !barEl) return;

    mainEl.onscroll = () => {
        const total = mainEl.scrollHeight - mainEl.clientHeight;
        if (total <= 0) {
            barEl.style.width = '0%';
            return;
        }
        const percentage = Math.min(100, Math.max(0, (mainEl.scrollTop / total) * 100));
        barEl.style.width = `${percentage}%`;
    };
}

/**
 * 모바일 사이드바 드로어 닫기
 */
function closeDrawer() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
}

/**
 * 모바일 메뉴 토글
 */
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('mobile-overlay');
    if (!sidebar || !overlay) return;
    
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

/**
 * 검색 키워드 핸들러
 */
function handleSearch(val) {
    store.searchKeyword = (val || '').toLowerCase().trim();
    renderSidebar();
    
    // 만약 메인 영역이 카드 목록 화면인 경우 실시간 메인 검색 결과도 갱신
    if (!store.currentPostId) {
        renderMainContent();
    }
}

/**
 * 정렬 옵션 변경 핸들러
 */
function handleSort(val) {
    store.sortOption = val;
    renderSidebar();
    if (!store.currentPostId) {
        renderMainContent();
    }
}

/**
 * 카테고리 전환 핸들러
 */
function switchCategory(cat) {
    store.activeCategory = cat;
    const theme = CATEGORY_THEMES[cat] || CATEGORY_THEMES.all;
    applyTheme(theme.color);

    // 검색어 초기화 (UX 개선)
    store.searchKeyword = '';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    // 사이드바 탭 상태 갱신 (데스크톱)
    document.querySelectorAll('.cat-tab').forEach(b => {
        const active = b.dataset.category === cat;
        b.classList.toggle('text-white', active);
        b.classList.toggle('bg-white/10', active);
        b.classList.toggle('text-slate-500', !active);
    });

    // 모바일 탭 및 아이콘 색상 동시 활성화
    document.querySelectorAll('.mob-tab').forEach(b => {
        const active = b.id === `mob-tab-${cat}`;
        b.style.color = active ? theme.color : '';
        const svg = b.querySelector('svg');
        if (svg) {
            svg.style.color = active ? theme.color : '';
            svg.style.stroke = active ? theme.color : '';
        }
    });

    renderSidebar();
    renderMainContent();
}

/**
 * 사이드바 글 목록 렌더링
 */
function renderSidebar() {
    const menu = document.getElementById('sidebar-menu');
    if (!menu) return;
    menu.innerHTML = '';

    const posts = store.getFilteredPosts();

    if (!posts.length) {
        menu.innerHTML = `<p class="px-5 py-8 text-center text-slate-500 text-xs">검색 결과가 없습니다.</p>`;
        return;
    }

    posts.forEach(post => {
        const isActive = post.id === store.currentPostId;
        const isHot = (post.views || 0) > 1000;
        const btn = document.createElement('button');
        btn.className = `post-item w-full text-left px-5 py-3.5 ${isActive ? 'active' : ''}`;
        btn.innerHTML = `
            <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-1.5">
                    <span class="t-label" style="color:var(--theme-color)">${post.category}</span>
                    ${post.youtubeId ? `<span class="text-[8px] font-extrabold text-red-400 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20">📺 영상</span>` : ''}
                    ${isHot ? `<span class="text-[8px] font-black text-red-400 bg-red-500/10 px-1 rounded">🔥 HOT</span>` : ''}
                </div>
                <span class="t-caption">${post.date}</span>
            </div>
            <p class="text-[13px] font-semibold text-slate-200 leading-snug line-clamp-2">${post.title}</p>
        `;
        btn.onclick = () => {
            if (window.loadPost) window.loadPost(post.id);
            closeDrawer();
        };
        menu.appendChild(btn);
    });
}

/**
 * 메인 영역 카드 목록 뷰 렌더링
 */
function renderMainContent() {
    const container = document.getElementById('main-content');
    if (!container) return;

    const theme = CATEGORY_THEMES[store.activeCategory] || CATEGORY_THEMES.all;
    const posts = store.getFilteredPosts();

    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'fade-in max-w-3xl mx-auto px-5 pt-8 pb-6';

    // 1. 데일리 펄스 (오늘의 한마디 & 시장 실시간 정보) - 거시금융 카테고리 진입 시 최상단 노출
    let pulseHtml = '';
    if (store.activeCategory === 'macro') {
        const targetPost = store.selectedDailyPulsePost || posts[0] || { title: "장기금리 흐름 전망", date: "2026.08.02", category: "📰 데일리", id: "macro-2026-06-28" };
        const displayQuote = targetPost.summary || "장기 국고채 분할 매수가 답입니다. 4.16%는 매력적인 1차 진입대입니다.";
        const displayTitle = (targetPost.title || '').replace(/\[.*?\]\s*/g, '');
        
        pulseHtml = `
            <section class="mb-8 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06] shadow-xl">
                <div class="flex items-center justify-between mb-3.5">
                    <span class="flex items-center gap-1.5 text-[10px] font-bold text-red-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                        LIVE 인사이트 연동 (${targetPost.date || '2026.08.02'})
                    </span>
                    <span class="text-[10px] text-slate-500 font-bold">작성자: 머니대디</span>
                </div>
                <h3 class="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">💡 연동된 오늘의 한마디</h3>
                <p class="quote-handwritten leading-relaxed mb-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.03]">
                    "${displayQuote}"
                </p>
                <div class="flex items-center justify-between gap-4 mb-4 pb-2">
                    <span class="text-[11px] text-slate-400 font-medium truncate">연계 리포트: <b>${displayTitle}</b></span>
                    <button onclick="window.loadPost('${targetPost.id}', true)" class="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 shrink-0 transition-colors flex items-center gap-1">
                        👉 리포트 전문 읽기 <span class="text-xs">→</span>
                    </button>
                </div>
                <div class="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/[0.04] text-center">
                    <div class="py-2 bg-white/[0.01] rounded border border-white/[0.02]">
                        <p class="text-[9px] font-bold text-slate-500">S&P 500</p>
                        <p class="text-xs font-bold text-emerald-400 mt-0.5">+0.34%</p>
                    </div>
                    <div class="text-center py-2 bg-white/[0.01] rounded border border-white/[0.02]">
                        <p class="text-[9px] font-bold text-slate-500">미 국채 10년</p>
                        <p class="text-xs font-bold text-slate-300 mt-0.5">4.37%</p>
                    </div>
                    <div class="text-center py-2 bg-white/[0.01] rounded border border-white/[0.02]">
                        <p class="text-[9px] font-bold text-slate-500">비트코인</p>
                        <p class="text-xs font-bold text-red-400 mt-0.5">$66,512</p>
                    </div>
                </div>
            </section>
        `;
    }

    // 2. 유튜브 추천 영상 영역 (홈화면 'all' 카테고리 시 최상단 동적 노출)
    let youtubeHtml = '';
    if (store.activeCategory === 'all') {
        const latestVideoPost = store.getLatestYoutubePost && store.getLatestYoutubePost();
        const popularVideoPost = store.getPopularYoutubePost && store.getPopularYoutubePost();

        // 1. 최고 인기 영상 동적 데이터 매핑
        const popId = popularVideoPost?.id || 'quantum-companies-2026-08-02';
        const popYtId = popularVideoPost?.youtubeId || '85WYstX6154';
        const popYtUrl = popularVideoPost?.youtubeUrl || `https://youtu.be/${popYtId}`;
        const popTitle = popularVideoPost?.title || '양자컴퓨팅 대장주 IONQ 주가 10배 폭등 시나리오 대공개';
        const popThumb = `https://img.youtube.com/vi/${popYtId}/hqdefault.jpg`;
        const popViewsText = popularVideoPost?.views ? `조회수 ${(popularVideoPost.views / 10000).toFixed(1)}만회` : '조회수 1.8만회';

        // 2. 최신 업로드 영상 동적 데이터 매핑 (posts.json 등록 시 자동 갱신)
        const latId = latestVideoPost?.id || 'ionq-sdt-korea-2026-09-22';
        const latYtId = latestVideoPost?.youtubeId || 'MJki4PIGdPU';
        const latYtUrl = latestVideoPost?.youtubeUrl || `https://youtu.be/${latYtId}`;
        const latTitle = latestVideoPost?.title || '아이온큐(IonQ) × 한국 SDT 파트너십 공시 해체 & Superion 256 구미 팹 긴급 진단';
        const latDate = latestVideoPost?.date || '2026.09.22';
        const latCategory = latestVideoPost?.category || '공시 팩트체크';
        const latThumb = `https://img.youtube.com/vi/${latYtId}/hqdefault.jpg`;

        youtubeHtml = `
            <section class="mb-8">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <span class="text-red-500 text-lg">❤️</span>
                        <h3 class="text-sm font-extrabold text-slate-200">머니대디 유튜브 추천 인사이트</h3>
                    </div>
                    <a href="https://www.youtube.com/@%EB%A8%B8%EB%8B%88%EB%8C%80%EB%94%94" target="_blank" class="text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors">
                        채널 바로가기 ↗
                    </a>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- 1. 최고 인기 영상 (동적 연동) -->
                    <div class="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 transition-all flex flex-col justify-between group">
                        <div>
                            <div class="flex items-center justify-between mb-2.5">
                                <span class="text-[9px] px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-black">🔥 최고 인기 분석</span>
                                <span class="text-[10px] text-slate-500 font-medium">${popViewsText}</span>
                            </div>
                            <a href="${popYtUrl}" target="_blank" class="block relative w-full rounded-xl overflow-hidden shadow-lg aspect-video bg-black flex items-center justify-center mb-3">
                                <img src="${popThumb}" alt="최고 인기 영상 썸네일" class="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300">
                                <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                                    <div class="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-all">
                                        <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            </a>
                            <p class="text-[13px] font-bold text-slate-200 line-clamp-1 leading-snug group-hover:text-white transition-colors">${popTitle}</p>
                        </div>
                        <div class="pt-3 mt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
                            <a href="${popYtUrl}" target="_blank" class="text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                                📺 영상 시청 ↗
                            </a>
                            <button onclick="window.loadPost('${popId}', true)" class="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1">
                                📖 심층 리포트 보기 →
                            </button>
                        </div>
                    </div>
                    
                    <!-- 2. 최신 업로드 영상 (posts.json 기반 100% 자동 연동) -->
                    <div class="p-4 rounded-2xl bg-white/[0.02] border border-sky-500/20 hover:border-sky-500/40 bg-gradient-to-b from-sky-500/[0.03] to-transparent transition-all flex flex-col justify-between group">
                        <div>
                            <div class="flex items-center justify-between mb-2.5">
                                <div class="flex items-center gap-1.5">
                                    <span class="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-black">⚡ 최신 업로드</span>
                                    <span class="text-[9px] px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded font-bold">${latCategory}</span>
                                </div>
                                <span class="text-[10px] text-amber-400 font-mono font-bold">${latDate}</span>
                            </div>
                            <a href="${latYtUrl}" target="_blank" class="block relative w-full rounded-xl overflow-hidden shadow-lg aspect-video bg-black flex items-center justify-center mb-3">
                                <img src="${latThumb}" alt="최신 영상 썸네일" class="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300">
                                <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                                    <div class="w-11 h-11 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-all">
                                        <svg class="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </div>
                            </a>
                            <p class="text-[13px] font-bold text-slate-100 line-clamp-1 leading-snug group-hover:text-white transition-colors">${latTitle}</p>
                        </div>
                        <div class="pt-3 mt-3 border-t border-white/[0.04] flex items-center justify-between gap-2">
                            <a href="${latYtUrl}" target="_blank" class="text-[11px] font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1">
                                📺 영상 시청 ↗
                            </a>
                            <button onclick="window.loadPost('${latId}', true)" class="px-2.5 py-1 rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-[11px] font-extrabold text-sky-400 hover:text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1 shadow-sm">
                                📖 심층 리포트 전문 읽기 →
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }

    // 섹션 헤더
    wrap.innerHTML = `
        ${pulseHtml}
        ${youtubeHtml}
        <header class="mb-6">
            <p class="t-label mb-1" style="color:var(--theme-color)">${theme.emoji} ${theme.label}</p>
            <h2 class="text-[20px] font-extrabold text-slate-100 leading-tight">최신 인사이트 아카이브</h2>
        </header>
    `;

    if (!posts.length) {
        wrap.innerHTML += `<div class="py-16 text-center"><p class="t-sub">검색 결과가 없습니다.</p></div>`;
    } else {
        const grid = document.createElement('div');
        grid.className = 'flex flex-col gap-3';
        posts.forEach((post, i) => {
            const isLatest = i === 0 && store.activeCategory === 'macro';
            const card = document.createElement('button');
            card.className = `post-card w-full text-left rounded-xl p-5 cursor-pointer`;
            if (isLatest) {
                card.style.boxShadow = `0 0 0 3px ${theme.color}35`;
                card.style.borderColor = theme.color;
            }
            
            const isHot = (post.views || 0) > 1000;
            
            card.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <span class="t-label" style="color:var(--theme-color)">${post.category}</span>
                        ${isLatest ? `<span class="text-[8px] font-black px-1.5 py-0.5 rounded" style="background:var(--theme-color);color:#0b0f19">NEW</span>` : ''}
                        ${post.youtubeId ? `<span class="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-0.5">📺 영상 해설</span>` : ''}
                        ${isHot ? `<span class="text-[8px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">🔥 HOT</span>` : ''}
                    </div>
                    <span class="t-caption">${post.date}</span>
                </div>
                <p class="text-[14px] font-semibold text-slate-100 leading-snug line-clamp-2">${post.title}</p>
                ${post.type === 'quick-tip' ? `<p class="text-xs text-slate-400 mt-2 line-clamp-2">${post.summary || ''}</p>` : ''}
            `;
            card.onclick = () => {
                if (window.loadPost) window.loadPost(post.id, true);
            };
            grid.appendChild(card);
        });
        wrap.appendChild(grid);
    }

    container.appendChild(wrap);
}

// B2B & API Modal Functions
function openB2BModal() {
    const modal = document.getElementById('b2b-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.firstElementChild) modal.firstElementChild.classList.remove('scale-95');
    }, 10);
}

function closeB2BModal() {
    const modal = document.getElementById('b2b-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    if (modal.firstElementChild) modal.firstElementChild.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

function submitB2BForm(e) {
    if (e) e.preventDefault();
    alert('문의가 정상적으로 제출되었습니다. 담당자가 신속히 연락해 드리겠습니다.');
    closeB2BModal();
    if (e && e.target && typeof e.target.reset === 'function') {
        e.target.reset();
    }
}

function triggerAPIAccess() {
    const modal = document.getElementById('api-modal');
    if (!modal) return;
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        if (modal.firstElementChild) modal.firstElementChild.classList.remove('scale-95');
    }, 10);
}

function closeApiModal() {
    const modal = document.getElementById('api-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    if (modal.firstElementChild) modal.firstElementChild.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// ── 북마크 & 공유 인터랙션 ──
function toggleBookmark(id) {
    const btn = document.getElementById(`btn-bm-${id}`);
    if (!btn) return;
    if (btn.classList.contains('text-amber-400')) {
        btn.classList.remove('text-amber-400');
        btn.innerHTML = '📌 북마크';
        alert('북마크가 해제되었습니다.');
    } else {
        btn.classList.add('text-amber-400');
        btn.innerHTML = '⭐ 북마크됨';
        alert('이 글이 내 관심 기사로 저장되었습니다.');
    }
}

function sharePost(title) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href);
    }
    alert(`클립보드에 링크가 복사되었습니다:\n"${title}"`);
}

// ── 다크 테마 DOM 정제 ──
function applyDarkOverride(root) {
    if (!root) return;
    const BRIGHT_BG = ['#ffffff','#f8fafc','#f1f5f9','#f0f9ff','#fafafa'];
    const BRIGHT_TEXT = ['#0f172a','#1e293b','#1e3a5f','#0a0f1d','#374151','#111827','#475569','#4b5563','#64748b'];

    root.querySelectorAll('[style]').forEach(el => {
        const s = el.style;
        const bgText = (s.background || '').toLowerCase();
        const isGradient = bgText.includes('gradient') || bgText.includes('linear-');

        if (!isGradient) {
            if (s.background && BRIGHT_BG.some(c => s.background.toLowerCase().includes(c.toLowerCase()))) {
                s.background = 'rgba(255,255,255,.02)';
                s.borderColor = 'rgba(255,255,255,.05)';
            }
            if (s.backgroundColor && BRIGHT_BG.some(c => s.backgroundColor.toLowerCase().includes(c.toLowerCase()))) {
                s.backgroundColor = 'rgba(255,255,255,.02)';
            }
        }

        if (s.color && BRIGHT_TEXT.some(c => s.color.toLowerCase().includes(c))) {
            s.color = '#e2e8f0';
        }

        if (s.borderColor && (s.borderColor.includes('#e2e8f0') || s.borderColor.includes('#f1f5f9') || s.borderColor.includes('#e5e7eb'))) {
            el.style.borderColor = 'rgba(255,255,255,.08)';
        }
    });

    root.querySelectorAll('table').forEach(t => {
        t.style.background = 'transparent';
        t.style.borderColor = 'rgba(255,255,255,.08)';
        t.querySelectorAll('thead').forEach(th => { 
            th.style.background = 'rgba(255,255,255,.04)'; 
        });
        t.querySelectorAll('tr').forEach((tr, i) => {
            tr.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)';
            tr.style.borderColor = 'rgba(255,255,255,.06)';
        });
        t.querySelectorAll('td, th, span, p').forEach(cell => {
            cell.style.color = '#e2e8f0';
        });
    });

    root.querySelectorAll('div').forEach(d => {
        if (d.id === 'dynamic-paywall' || d.classList.contains('author-hero')) return;
        
        const bg = (d.style.background || '').toLowerCase();
        if (bg.includes('eff6ff') || bg.includes('fbf7ff') || bg.includes('f8fafc') || bg.includes('f1f5f9')) {
            d.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)';
            d.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            d.style.color = '#f8fafc';
            d.classList.add('summary-card');
            
            d.querySelectorAll('p, span, b, li, h2, h3, h4').forEach(child => {
                child.style.color = '#f8fafc';
            });
        }
    });

    root.querySelectorAll('[style*="background:#f1f5f9"]').forEach(d => {
        d.style.background = 'rgba(255,255,255,.03)';
        d.style.borderColor = 'rgba(255,255,255,.06)';
        d.classList.add('related-block');
        d.querySelectorAll('p, span, b, button').forEach(child => {
            child.style.color = '#e2e8f0';
        });
    });
    
    root.querySelectorAll('h1, h2, h3, h4, h5').forEach(h => {
        const col = h.style.color;
        if (!col || BRIGHT_TEXT.some(c => col.toLowerCase().includes(c))) {
            h.style.color = '#ffffff';
        }
    });
}

// ── 70% 스크롤 감지 페이월 트리거 ──
function initScrollPaywall(scrollEl, paywallEl) {
    if (!scrollEl || !paywallEl) return;

    const isLocal = location.protocol === 'file:' || 
                    location.hostname === 'localhost' || 
                    location.hostname === '127.0.0.1' || 
                    location.hostname.startsWith('192.168.') ||
                    location.hostname.startsWith('10.');
    if (isLocal || localStorage.getItem('isPro') === 'true' || localStorage.getItem('isOwner') === 'true') {
        return;
    }

    let paywallShown = false;
    
    scrollEl.onscroll = () => {
        const totalScrollable = scrollEl.scrollHeight - scrollEl.clientHeight;
        if (totalScrollable <= 100) return;
        
        const scrolled = scrollEl.scrollTop / totalScrollable;
        if (scrolled > 0.65 && !paywallShown) {
            paywallEl.classList.add('active');
            const wrapEl = scrollEl.querySelector('.article-wrap');
            if (wrapEl) {
                wrapEl.classList.add('filter', 'blur-[2px]', 'pointer-events-none', 'select-none', 'opacity-30');
            }
            paywallShown = true;
        }
    };
}


// Global Window Exposure for Inline Event Handlers
window.applyTheme = applyTheme;
window.goHome = goHome;
window.closeDrawer = closeDrawer;
window.toggleMobileMenu = toggleMobileMenu;
window.handleSearch = handleSearch;
window.handleSort = handleSort;
window.renderSidebar = renderSidebar;
window.switchCategory = switchCategory;
window.renderMainContent = renderMainContent;
window.openB2BModal = openB2BModal;
window.closeB2BModal = closeB2BModal;
window.submitB2BForm = submitB2BForm;
window.triggerAPIAccess = triggerAPIAccess;
window.closeApiModal = closeApiModal;
window.toggleBookmark = toggleBookmark;
window.sharePost = sharePost;
window.applyDarkOverride = applyDarkOverride;
window.initScrollPaywall = initScrollPaywall;
window.setupScrollProgressBar = setupScrollProgressBar;
