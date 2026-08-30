/**
 * MoneyDaddy - State & Data Store (js/store.js)
 * 정적 JSON 데이터 비동기 로딩 및 애플리케이션 상태 관리
 */

// 카테고리별 테마 정의
const CATEGORY_THEMES = {
    all:   { color: '#38bdf8', label: '전체 인사이트',       emoji: '✨' },
    macro: { color: '#10b981', label: '거시금융 · 데일리', emoji: '📈' },
    tech:  { color: '#818cf8', label: '테크 · ETF 분석',   emoji: '⚙️' },
    essay: { color: '#fbbf24', label: '백과사전 · 에세이',  emoji: '📚' }
};

// 카테고리와 포스트 타입 매핑
const TYPE_CATEGORY_MAP = {
    macro: ['macro', 'daily', 'report', 'quick-tip', 'fx-intervention'],
    tech:  ['ionq-joby', 'skt', 'interactive', 'quantum-report', 'finance-etf', 'ionq-achilles', 'nvidia-quantum', 'ionq-financial-valuation'],
    essay: ['dictionary', 'essay']
};

// 기본 내장 ETF Master 데이터 (Fetch 실패 또는 오프라인 Fallback용)
const FALLBACK_ETF_MASTER = {
    XLF: { title: "Financial Select Sector SPDR", ticker: "XLF", index: "Financial Select Sector Index", constituents: ["BRK.B", "JPM", "Visa", "Mastercard"], summary: "안정적인 종합 금융 대장주", details: "금융 전반을 아우르는 시총 가중 ETF로 금리 인상기 안정적 수익을 제공합니다.", fee: "0.09%", yield: "1.6%", color: "#1d4ed8" },
    KBE: { title: "SPDR S&P Bank ETF", ticker: "KBE", index: "S&P Banks Index", constituents: ["Wells Fargo", "Citigroup", "First Citizens"], summary: "수정 동일 가중 은행 ETF", details: "대형주에 쏠리지 않고 섹터 전반의 은행 마진 개선 수혜를 균형 있게 추구합니다.", fee: "0.35%", yield: "2.8%", color: "#059669" },
    KRE: { title: "SPDR S&P Regional Banking ETF", ticker: "KRE", index: "S&P Regional Banks Index", constituents: ["Regions", "Zions", "Huntington"], summary: "미국 지역 은행 집중 투자", details: "로컬 경제와 밀접하며 M&A 및 고배당 메리트가 돋보이는 공격적 선택지입니다.", fee: "0.35%", yield: "3.2%", color: "#d97706" },
    QTUM: { title: "Defiance Quantum Strategy ETF", ticker: "QTUM", index: "BlueStar Quantum Computing Index", constituents: ["Nvidia", "Micron", "Applied Materials"], summary: "하드웨어 기반 양자 혁신", details: "양자 컴퓨팅 하드웨어와 반도체 공급망의 핵심 기업들에 선제적으로 투자합니다.", fee: "0.40%", yield: "0.9%", color: "#4f46e5" },
    TEKZ: { title: "First Trust Cloud & Quantum ETF", ticker: "TEKZ", index: "First Trust Cloud & Quantum Index", constituents: ["Microsoft", "Amazon", "Alphabet"], summary: "클라우드 서비스형 양자(QaaS)", details: "빅테크의 클라우드 플랫폼 성장과 양자 기술의 시너지를 결합한 안정적 기술주입니다.", fee: "0.60%", yield: "0.3%", color: "#6366f1" },
    LOUP: { title: "Invesco AI and Next Gen Software", ticker: "LOUP", index: "Loup Frontier Tech Index", constituents: ["IonQ", "Rigetti", "D-Wave"], summary: "파괴적 혁신 기술 선점", details: "미래를 바꿀 30개의 정예 소프트웨어 및 하드웨어 스타트업 기업에 베팅합니다.", fee: "0.70%", yield: "0.0%", color: "#a855f7" },
    DTCR: { title: "Global X Data Center & Digital Infra", ticker: "DTCR", index: "Solactive Digital Infra Index", constituents: ["Equinix", "Digital Realty", "TSMC"], summary: "하드웨어 성장을 품은 데이터 인프라", details: "리츠뿐만 아니라 서버, 서버칩 등 하드웨어 제조사 비중이 높아 공격적 성향에 적합합니다.", fee: "0.50%", yield: "1.2%", color: "#1d4ed8" },
    SRVR: { title: "Pacer Data & Infra Real Estate", ticker: "SRVR", index: "Kelly Data Center & Tower Index", constituents: ["Equinix", "American Tower", "Crown Castle"], summary: "안정적 배당의 순수 리츠", details: "기술주를 배제하고 물리적 자산(부동산) 임대 수익에 집중하여 금리 하락 시 재평가를 노립니다.", fee: "0.60%", yield: "3.5%", color: "#059669" },
    IDGT: { title: "iShares U.S. Digital Infra & RE", ticker: "IDGT", index: "S&P Data Center Index", constituents: ["Equinix", "Digital Realty", "SBA Comm"], summary: "블랙록의 저비용 인프라 대안", details: "낮은 운용 보수로 미국 내 디지털 인프라 핵심 기업을 효율적으로 보유할 수 있습니다.", fee: "0.41%", yield: "1.8%", color: "#d97706" },
    GRID: { title: "First Trust NASDAQ Smart Grid", ticker: "GRID", index: "NASDAQ Smart Grid Index", constituents: ["Eaton", "ABB", "Schneider Electric"], summary: "변압기 슈퍼사이클의 왕", details: "전력망 현대화 및 데이터 센터 전용 전력 장비 시장을 과점한 글로벌 제조사에 집중합니다.", fee: "0.57%", yield: "1.1%", color: "#4f46e5" },
    PAVE: { title: "Global X U.S. Infrastructure Dev", ticker: "PAVE", index: "Indxx U.S. Infrastructure Index", constituents: ["United Rentals", "Eaton", "Quanta Services"], summary: "제조업 리쇼어링의 최대 수혜", details: "미국 내 공장 건설과 인프라 현대화 전반을 포괄하는 초대형 인프라 ETF입니다.", fee: "0.47%", yield: "0.7%", color: "#6366f1" },
    XLU: { title: "Utilities Select Sector SPDR", ticker: "XLU", index: "Utilities Select Index", constituents: ["NextEra", "Duke", "Southern Co"], summary: "에너지 안보와 성장의 유틸리티", details: "데이터 센터와 직접 계약하는 전력 회사들의 성장판이 열리며 재조명받고 있습니다.", fee: "0.09%", yield: "3.1%", color: "#a855f7" }
};

// 기본 포스트 Fallback 데이터
const FALLBACK_POSTS = [
    { "id": "ionq-financial-valuation-2026-08-22", "category": "📊 실적분석", "title": "아이온큐(IonQ) 실적·재무 건전성 및 2026~2030 밸류에이션 동학 (시리즈 3편 & 4편)", "date": "2026.08.22", "type": "ionq-financial-valuation", "views": 0, "readTime": "18분", "summary": "무료 PoC와 상용 RPO 매출 구분법, 3대 킬러 유즈케이스 실증 성과, 금리 인하와 포스트 AI 사이클 하이프 진입에 대응하는 3단계 자산 배분 모델" },
    { "id": "nvidia-quantum-2026-08-22", "category": "📊 산업분석", "title": "엔비디아의 양자 컴퓨팅 전략 분석: QPU 비제조 이유와 하이브리드 양자 OS 생태계(CUDA-Q·NVQLink)의 독점 아키텍처", "date": "2026.08.22", "type": "nvidia-quantum", "views": 0, "readTime": "12분", "summary": "엔비디아가 자체 QPU를 만들지 않고 CUDA-Q와 NVQLink를 통해 양자 생태계를 장악하는 전략적 아키텍처와 아이온큐 동맹의 정밀 분석" },
    { "id": "ionq-achilles-2026-08-16", "category": "⚛️ 기술심층", "title": "아이온큐(IonQ)의 숨겨진 아킬레스건: 광학 인터커넥트 병목과 Entangled Networks 인수 배경 심층 분석", "date": "2026.08.16", "type": "ionq-achilles", "views": 0, "readTime": "20분", "summary": "포획 이온 QPU 모듈 간 원격 얽힘 속도의 물리적 한계, 성능 간극(Gap Analysis), 그리고 소프트웨어·하드웨어 돌파 전략까지 — IonQ 10배 상승을 가르는 단 하나의 기술적 변수" },
    { "id": "fx-intervention-2026-08-11", "category": "📰 거시경제", "title": "원/달러(USD/KRW) 외환당국의 개입 메커니즘과 연쇄적 가격 하락(Cascading Downside) 파급 채널에 대한 실증 및 이론적 연구", "date": "2026.08.11", "type": "fx-intervention", "views": 1024 },
    { "id": "ionq-joby-2026-08-10", "category": "📊 수급분석", "title": "2026년 하반기 아이온큐(IONQ) 펀더멘털 및 파생 수급 기반 기대 주가(E(X)) 심층 분석", "date": "2026.08.10", "type": "ionq-joby", "views": 890 },
    { "id": "quantum-companies-2026-08-02", "category": "📊 산업분석", "title": "[2026.08.02] 2026 양자컴퓨팅 기업 상용화 경쟁력 심층 분석: IBM vs IonQ", "date": "2026.08.02", "type": "quantum-report", "views": 1820, "readTime": "15분", "summary": "'오류 정정' 임계점을 넘어선 양자컴퓨팅 시장에서 IBM and IonQ의 기술적 성숙도와 상용화 경쟁력을 비교 분석합니다." },
    { "id": "tip-2026-08-02", "category": "💡 1분 팁", "title": "ETF 수수료 0.5% 차이가 30년 후엔 얼마나 엄청난 차이를 만들까?", "date": "2026.08.02", "type": "quick-tip", "views": 1560, "readTime": "1분", "summary": "연 7% 수익률 가정 시, 0.5% 수수료 차이는 30년 후 원금의 12%를 차감시킵니다. 수수료가 제일 싼 운용사를 골라야 하는 이유입니다." },
    { "id": "essay-investing-philosophy-2026", "category": "✍️ 에세이", "title": "아빠가 되고 나서야 알게 된 투자의 진짜 의미 — 머니대디의 투자 철학", "date": "2026.07.15", "type": "essay", "views": 720, "readTime": "7분", "summary": "수익률보다 중요한 것이 있다. 15년 금융업에 종사하며, 그리고 아이의 아빠가 되고 나서 비로소 깨달은 '지속 가능한 투자'에 대한 생각을 솔직하게 씁니다." },
    { "id": "macro-2026-06-28", "category": "📰 데일리", "title": "[2026.06.28] 2026년 글로벌 거시금융 환경의 전환점: 장기금리 흐름 전망과 AI·반도체 슈퍼사이클의 지속성 및 상호 상관관계 분석", "date": "2026.06.28", "type": "macro", "views": 1240 },
    { "id": "essay-etf-mistakes-2026", "category": "✍️ 에세이", "title": "ETF 투자 5년, 내가 저지른 실수 3가지와 그 교훈", "date": "2026.06.10", "type": "essay", "views": 480, "readTime": "5분", "summary": "섹터 ETF 타이밍 미스, 환헤지 간과, 수수료 무시 — 직접 돈을 잃으며 배운 세 가지 실수담과 구체적인 해결책을 공유합니다." },
    { "id": "daily-2026-06-02", "category": "📰 데일리", "title": "[2026.06.02] 'K자형 분열': AI 랠리 속 관세의 그림자, 연준의 새 선장 워시", "date": "2026.06.02", "type": "daily", "views": 412 },
    { "id": "skt-2026-06-02", "category": "📊 종목분석", "title": "[2026.06.02] SKT: 엔비디아·앤트로픽·스타링크 3각 동맹이 촉발할 통신주의 구조적 리레이팅", "date": "2026.06.02", "type": "skt", "views": 530 },
    { "id": "ai-infra-2026-full", "category": "리포트", "title": "2026 글로벌 AI 인프라 투자 보고서: 데이터 센터와 전력망 분석", "date": "2026.01.22", "type": "report", "views": 2100 },
    { "id": "power-analysis", "category": "ETF 분석", "title": "전력 인프라 ETF (GRID, PAVE, XLU) 분석", "date": "2026.01.22", "type": "interactive", "categoryKey": "power", "views": 670 },
    { "id": "data-analysis", "category": "ETF 분석", "title": "데이터 인프라 ETF (DTCR, SRVR, IDGT) 분석", "date": "2026.01.22", "type": "interactive", "categoryKey": "data", "views": 420 },
    { "id": "etf-dictionary", "category": "백과사전", "title": "📖 머니대디 ETF 백과사전 — 12종 완전 해설", "date": "2026.01.22", "type": "dictionary", "views": 3200 },
    { "id": "quantum-analysis", "category": "ETF 분석", "title": "양자컴퓨터 ETF (QTUM, TEKZ, LOUP) 분석", "date": "2026.01.19", "type": "interactive", "categoryKey": "quantum", "views": 810 },
    { "id": "finance-analysis", "category": "💰 금융주 ETF", "title": "금융주 ETF (XLF, KBE, KRE) 분석 — 금리 수혜 섹터 집중 해부", "date": "2026.01.18", "type": "finance-etf", "categoryKey": "finance", "views": 940 }
];

const store = {
    POSTS_DATABASE: [],
    ETF_MASTER_DB: {},
    activeCategory: 'all',
    searchKeyword: '',
    sortOption: 'latest',
    currentPostId: '',
    selectedDailyPulsePost: null,
    CATEGORY_THEMES,
    TYPE_CATEGORY_MAP,

    /**
     * 데이터베이스 비동기 초기화
     */
    async init() {
        try {
            const [postsRes, etfRes] = await Promise.all([
                fetch('data/posts.json'),
                fetch('data/etf_master.json')
            ]);

            if (postsRes.ok) {
                this.POSTS_DATABASE = await postsRes.json();
            } else {
                console.warn('posts.json 로드 실패, Fallback 데이터를 사용합니다.');
                this.POSTS_DATABASE = [...FALLBACK_POSTS];
            }

            if (etfRes.ok) {
                this.ETF_MASTER_DB = await etfRes.json();
            } else {
                console.warn('etf_master.json 로드 실패, Fallback 데이터를 사용합니다.');
                this.ETF_MASTER_DB = { ...FALLBACK_ETF_MASTER };
            }
        } catch (error) {
            console.warn('데이터 파일 로딩 중 예외 발생 (file:// protocol 등), 내장 Fallback 사용:', error);
            this.POSTS_DATABASE = [...FALLBACK_POSTS];
            this.ETF_MASTER_DB = { ...FALLBACK_ETF_MASTER };
        }

        if (this.POSTS_DATABASE.length > 0 && !this.currentPostId) {
            this.currentPostId = this.POSTS_DATABASE[0].id;
        }

        return true;
    },

    /**
     * 조건에 따른 포스트 목록 필터링 및 정렬
     */
    getFilteredPosts(category = this.activeCategory, keyword = this.searchKeyword, sort = this.sortOption) {
        let posts = category === 'all'
            ? [...this.POSTS_DATABASE]
            : this.POSTS_DATABASE.filter(p => (this.TYPE_CATEGORY_MAP[category] || []).includes(p.type));

        if (keyword) {
            const kw = keyword.toLowerCase().trim();
            posts = posts.filter(p => 
                (p.title && p.title.toLowerCase().includes(kw)) || 
                (p.category && p.category.toLowerCase().includes(kw)) ||
                (p.summary && p.summary.toLowerCase().includes(kw))
            );
        }

        if (sort === 'views') {
            posts.sort((a, b) => (b.views || 0) - (a.views || 0));
        } else {
            posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        }

        return posts;
    },

    /**
     * ID로 포스트 단건 조회 (별칭 및 접두사 호환 지원)
     */
    getPostById(id) {
        if (!id) return null;
        let post = this.POSTS_DATABASE.find(p => p.id === id);
        if (post) return post;

        // 과거 링크 호환용 (예: ionq-joby-2026-06-23 -> ionq-joby-2026-08-10)
        if (id.startsWith('ionq-joby')) {
            return this.POSTS_DATABASE.find(p => p.type === 'ionq-joby') || null;
        }
        if (id.startsWith('quantum-companies')) {
            return this.POSTS_DATABASE.find(p => p.type === 'quantum-report') || null;
        }
        return null;
    },

    /**
     * 포스트의 상위 카테고리 분류 반환 (macro, tech, essay)
     */
    getCategoryForPost(post) {
        if (!post) return 'macro';
        if (this.TYPE_CATEGORY_MAP.tech.includes(post.type)) return 'tech';
        if (this.TYPE_CATEGORY_MAP.essay.includes(post.type)) return 'essay';
        return 'macro';
    },

    /**
     * 로컬 스토리지 기반 포스트 조회수 증가
     */
    incrementViews(postId) {
        if (!postId) return;
        const key = `viewed_${postId}`;
        try {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, 'true');
                const post = this.getPostById(postId);
                if (post) {
                    post.views = (post.views || 0) + 1;
                }
            }
        } catch (e) {
            console.warn('localStorage 조회수 업데이트 오류:', e);
        }
    }
};

window.CATEGORY_THEMES = CATEGORY_THEMES;
window.TYPE_CATEGORY_MAP = TYPE_CATEGORY_MAP;
window.store = store;
