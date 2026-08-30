/**
 * MoneyDaddy - Main Application Entry Point (js/app.js)
 * 데이터 스토어 초기화 및 부팅
 */

async function bootstrap() {
    try {
        console.log('MoneyDaddy 앱 초기화 시작...');
        // 1. JSON 정적 데이터베이스 초기화
        await window.store.init();
        
        // 2. 사이드바, 홈 화면 및 진행 바 이벤트 렌더링
        window.renderSidebar();
        window.setupScrollProgressBar();
        window.goHome();
        
        console.log('MoneyDaddy 앱 초기화 완료: 데이터 및 뷰 로딩 성공.');
    } catch (error) {
        console.error('MoneyDaddy 초기화 중 오류 발생:', error);
    }
}

// DOM 준비 완료 시 부팅
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
} else {
    bootstrap();
}
