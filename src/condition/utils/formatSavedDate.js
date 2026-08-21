/*
 * 저장한 조건 목록(user-conditions/saved)의 createdAt을 "YYYY.MM.DD" 형태로 바꾼다.
 *
 * new Date(createdAt)을 바로 쓰면 안 되는 이유: 스프링 Jackson이 LocalDateTime을
 * JSON 배열로 직렬화하는 설정이면(WRITE_DATES_AS_TIMESTAMPS 등) createdAt이
 * "2026-08-01T12:00:00" 같은 문자열이 아니라 [2026, 8, 1, 12, 0, 0] 배열로 와서
 * new Date(배열)이 Invalid Date가 된다(review/constants.js의 parseCreatedAt에서
 * 먼저 겪은 문제와 같은 원인). 배열/문자열/Date 객체를 모두 방어적으로 처리한다.
 */
export function formatSavedDate(createdAt) {
  if (!createdAt) return "";

  let year, month, day;

  if (Array.isArray(createdAt)) {
    [year, month, day] = createdAt;
  } else {
    const date = createdAt instanceof Date ? createdAt : new Date(createdAt);
    if (Number.isNaN(date.getTime())) return "";
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return "";

  return `${year}.${String(month).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
}
