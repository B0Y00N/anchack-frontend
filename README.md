# 안착 (Vue 버전)

원본 Figma Make React 프로젝트(`App.tsx`, 2105줄)를 보내주신 Vue 아키텍처에 맞춰 변환한 결과물입니다.

## 실행 방법

```bash
npm i
npm install @tailwindcss/vite
npm install lucide-vue-next
npm install tw-animate-css
npm run dev
```

## 구조

기존에 정리해드린 아키텍처 그대로입니다 (`components/`, `views/`, `router/`, `stores/`, `composables/`, `utils/`).

## 원본과 달라진 점 (알아두시면 좋은 것들)

1. **라우팅**: 원본은 `page` state 문자열로 화면을 전환했지만, 여기서는 실제 `vue-router` 경로로 바뀌었습니다.
   - `/` 홈, `/login` `/signup`, `/search/step/1~5` `/search/loading` `/search/results` `/search/results/:id` `/search/results/:id/listings` `/search/compare`, `/explore` `/explore/:district` `/explore/:district/:dong`, `/mypage` `/mypage/favorites`
2. **상태관리**: 전역 state는 Pinia 스토어 4개로 나눴습니다 (`useAuthStore`, `useSearchStore`, `useNeighborhoodStore`, `useMyPageStore`).
3. **차트**: `recharts`(BarChart, RadarChart)는 React 전용이라 그대로 옮길 수 없어서, 간단한 자체 바 차트(`components/common/MiniBarChart.vue`)와 기존 `ScoreBar.vue`로 대체했습니다. 실제 프로덕션에서는 `vue-chartjs`나 `vue-echarts` 도입을 권장드려요.
4. **FavoritesPage**: 마이페이지의 "관심 동네" 탭(`SavedNeighborhoodList.vue`)과 내용이 거의 동일해서 별도 페이지로 만들지 않고, GNB의 "관심 동네" 버튼이 `/mypage/favorites`로 이동해 해당 탭이 바로 열리도록 처리했습니다.
5. **컴포넌트 UI 라이브러리** (`components/ui/*`, shadcn 45종)는 이전에 별도로 변환해드린 `vue-ui-components.zip`에 있고, 이번 변환본에는 포함되어 있지 않습니다. 실제 앱(`App.tsx`)에서 사용되지 않던 컴포넌트라 이 프로젝트는 자체 스타일의 순수 Tailwind 마크업으로 작성됐습니다.

## 알려진 제약 (1차 변환 기준)

- `Calendar`, `Carousel` 등은 이번 변환 범위에 없습니다 (이전 UI 컴포넌트 변환본 참고).
- 지도(SVG)는 목업 좌표 기반이라 실제 지도 API 연동 시 좌표 로직을 교체해야 합니다.
- `api/` 폴더는 뼈대만 있고 실제 axios 연동은 되어 있지 않습니다 (`utils/mockData.js`의 목데이터로 화면이 동작합니다).
