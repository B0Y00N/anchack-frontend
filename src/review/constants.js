/*
 * 백엔드 review_categories.code <-> 화면 표시용 한글 라벨 매핑.
 *
 * 리뷰 작성/수정/조회와 관련된 모든 화면은 반드시 이 파일의 상수를 사용한다.
 */
export const CATEGORY_CODE_TO_LABEL = {
  NOISE: "소음",
  CLEANLINESS: "청결",
  SAFETY: "치안",
  ATMOSPHERE: "분위기",
  TRANSIT: "교통",
};

// 화면에 표시할 항목별 별점 라벨 목록
export const REVIEW_CATEGORIES = Object.values(CATEGORY_CODE_TO_LABEL);

// 한글 라벨 -> 백엔드 카테고리 코드 역매핑
export const CATEGORY_LABEL_TO_CODE = Object.fromEntries(
  Object.entries(CATEGORY_CODE_TO_LABEL).map(([code, label]) => [label, code]),
);

/**
 * createdAt 값을 화면 표시용 날짜 형식으로 변환한다.
 *
 * 지원 형식:
 * - "2026-08-01T12:00:00"
 * - "2026-08-01"
 * - [2026, 8, 1]
 * - Date 객체
 */
function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return "";
  }

  if (typeof createdAt === "string") {
    return createdAt.slice(0, 10).replaceAll("-", ".");
  }

  if (Array.isArray(createdAt)) {
    const [year, month, day] = createdAt;

    if (!year || !month || !day) {
      return "";
    }

    return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(
      2,
      "0",
    )}`;
  }

  if (createdAt instanceof Date) {
    if (Number.isNaN(createdAt.getTime())) {
      return "";
    }

    return createdAt.toISOString().slice(0, 10).replaceAll("-", ".");
  }

  return "";
}

/*
 * 백엔드 ReviewResponse를 화면에서 사용하는 형태로 변환한다.
 *
 * 실제 API 응답 예시:
 * {
 *   reviewId: 1,
 *   adminDongId: 12,
 *   adminDongName: "증산동",
 *   guName: "은평구",
 *   overallRating: 4,
 *   content: "...",
 *   anonymous: false,
 *   status: "ACTIVE",
 *   writerId: 3,
 *   writerNickname: "홍길동",
 *   categoryScores: {
 *     NOISE: 4,
 *     CLEANLINESS: 5,
 *     SAFETY: 4,
 *     ATMOSPHERE: 4,
 *     TRANSIT: 3
 *   },
 *   createdAt: "2026-08-01T12:00:00",
 *   updatedAt: "2026-08-01T12:00:00"
 * }
 */
export function mapReviewResponse(apiReview = {}) {
  const ratings = {};

  Object.entries(apiReview.categoryScores || {}).forEach(([code, score]) => {
    const label = CATEGORY_CODE_TO_LABEL[code] || code;
    ratings[label] = score;
  });

  const isAnonymous =
    apiReview.anonymous === true || apiReview.isAnonymous === true;

  return {
    id: apiReview.reviewId,
    reviewId: apiReview.reviewId,
    adminDongId: apiReview.adminDongId,
    district: apiReview.guName || "",
    dong: apiReview.adminDongName || "",
    author: isAnonymous
      ? "익명"
      : apiReview.writerNickname || apiReview.nickname || "익명",
    date: formatCreatedAt(apiReview.createdAt),
    overallRating: apiReview.overallRating,
    content: apiReview.content || "",
    anonymous: isAnonymous,
    isAnonymous,
    status: apiReview.status,
    writerId: apiReview.writerId,
    ratings,
  };
}
