/*
 * 지하철/버스 노선 색상 매핑. 카카오 길찾기 응답엔 색상 정보가 없어서
 * (API_USER_CONDITIONS_REVISION_REQUEST.md P1-a 참고) 프론트가 직접 관리한다.
 *
 * 지하철은 lineNum(백엔드가 카카오 vehicles[0].name을 그대로 전달, 예: "6호선")으로,
 * 버스는 노선 번호가 아니라 vehicleType(카카오 vehicles[0].type: 간선/지선/순환/광역/마을)으로
 * 매핑한다 — 버스는 노선 수가 너무 많아 번호별로는 매핑할 수 없다.
 */

const SUBWAY_LINE_COLORS = {
  "1호선": "#004A85",
  "2호선": "#00A23F",
  "3호선": "#ED6C00",
  "4호선": "#009BCE",
  "5호선": "#794698",
  "6호선": "#7C4932",
  "7호선": "#6E7E31",
  "8호선": "#D11D70",
  "9호선": "#A49D87",
  경의중앙선: "#6AC2B3",
  수인분당선: "#ECA300",
  신분당선: "#B81B30",
  공항철도: "#0079AC",
  경춘선: "#007A62",
  우이신설선: "#BACC50",
  서해선: "#5EAC41",
  김포골드라인: "#957326",
  신림선: "#5E7DBB",
};
const SUBWAY_FALLBACK_COLOR = "#4A4A4A";

const BUS_TYPE_COLORS = {
  간선: "#0068B7",
  지선: "#53B332",
  순환: "#F2B70A",
  광역: "#E60012",
  마을: "#53B332",
};
const BUS_FALLBACK_COLOR = "#6789CA";

export function resolveLineColor({ transportType, lineNum, vehicleType }) {
  if (transportType === "BUS") {
    return BUS_TYPE_COLORS[vehicleType] ?? BUS_FALLBACK_COLOR;
  }
  return SUBWAY_LINE_COLORS[lineNum] ?? SUBWAY_FALLBACK_COLOR;
}
