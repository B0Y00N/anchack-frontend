<script setup>
import SproutLogo from "./SproutLogo.vue";
</script>

<template>
  <footer class="bg-white border-t border-border mt-auto">
    <div class="max-w-5xl mx-auto px-8 py-12">
      <div class="flex items-start gap-12">
        <div class="flex-shrink-0">
          <div class="flex items-center gap-2.5 mb-3">
            <SproutLogo :size="28" />
            <span class="font-bold text-foreground text-base">안착</span>
          </div>
          <p class="text-xs text-muted-foreground leading-relaxed">사회 초년생을 위한<br />맞춤 동네 추천 서비스</p>
        </div>
        <div class="flex-1 grid grid-cols-2 gap-8">
          <div>
            <h4 class="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">데이터 출처</h4>
            <ul class="space-y-1.5 text-xs text-muted-foreground">
              <li>• 부동산 시세: 국토교통부 실거래가 공개시스템</li>
              <li>• 치안 데이터: 경찰청 범죄통계 공공데이터</li>
              <li>• 대중교통: 서울시 교통정보시스템 (TOPIS)</li>
              <li>• 생활 인프라: 공공데이터포털 (data.go.kr)</li>
            </ul>
          </div>
          <div>
            <h4 class="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">이용 안내</h4>
            <p class="text-xs text-muted-foreground leading-relaxed">본 서비스의 정보는 참고용이며 실제 거래 전 별도 검증을 권장합니다. 리뷰 내용은 작성자 개인 의견으로 안착의 공식 입장과 다를 수 있습니다.</p>
          </div>
        </div>
      </div>
      <div class="border-t border-border mt-8 pt-6 flex items-center justify-between">
        <p class="text-xs text-muted-foreground">© 2025 안착(AnChak). All rights reserved.</p>
        <div class="flex gap-6 text-xs text-muted-foreground">
          <button class="hover:text-primary transition-colors">이용약관</button>
          <button class="hover:text-primary transition-colors">개인정보처리방침</button>
          <button class="hover:text-primary transition-colors">문의하기</button>
        </div>
      </div>
    </div>
  </footer>
</template>
