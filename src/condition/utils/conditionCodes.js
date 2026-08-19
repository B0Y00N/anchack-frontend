/*
 * 조건 입력 마법사(appState)의 한글 라벨을 API_USER_CONDITIONS.md가 정의한
 * 백엔드 코드로 변환한다. POST /api/user-conditions 요청 바디를 만드는 곳은 여기 하나로 모은다.
 */

const PRIORITY_CODE_MAP = {
  교통: "TRANSIT",
  치안: "SAFETY",
  운동: "SPORTS",
  식생활: "FOOD",
  편의시설: "CONVENIENCE",
  의료: "HEALTHCARE",
  문화생활: "CULTURE",
  자연환경: "NATURE",
  "조용한 동네": "SILENCE",
};

const MUST_HAVE_CODE_MAP = {
  편의점: "CONVENIENCE_STORE",
  헬스장: "GYM",
  병원: "HOSPITAL",
  공원: "PARK",
  대형마트: "MART",
};

// "단독·다가구"는 화면엔 버튼 하나지만 API는 DETACHED/MULTI_HOUSEHOLD를 별도 코드로 받는다(둘 다 전송).
const HOUSING_CODE_MAP = {
  오피스텔: ["OFFICETEL"],
  "빌라·다세대": ["VILLA"],
  "단독·다가구": ["DETACHED", "MULTI_HOUSEHOLD"],
  아파트: ["APARTMENT"],
  원룸: ["ONE_ROOM"],
};

// public/gus.csv (코드, 구 이름) 기준. 서울 25개 구는 새로 생기지 않으므로 하드코딩한다.
const GU_CODE_MAP = {
  종로구: "11010",
  중구: "11020",
  용산구: "11030",
  성동구: "11040",
  광진구: "11050",
  동대문구: "11060",
  중랑구: "11070",
  성북구: "11080",
  강북구: "11090",
  도봉구: "11100",
  노원구: "11110",
  은평구: "11120",
  서대문구: "11130",
  마포구: "11140",
  양천구: "11150",
  강서구: "11160",
  구로구: "11170",
  금천구: "11180",
  영등포구: "11190",
  동작구: "11200",
  관악구: "11210",
  서초구: "11220",
  강남구: "11230",
  송파구: "11240",
  강동구: "11250",
};

const COMMUTE_TYPE_MAP = {
  대중교통: "PUBLIC_TRANSIT",
  자가용: "CAR",
};

const RENTAL_TYPE_MAP = {
  월세: "MONTHLY",
  전세: "JEONSE",
};

function parseMinArea(label) {
  const match = /^(\d+)/.exec(label || "");
  return match ? Number(match[1]) : undefined;
}

/**
 * useSearchStore의 appState(한글 UI 상태)를 POST /api/user-conditions 요청 바디로 변환한다.
 */
export function buildUserConditionPayload(appState) {
  const isKnownAddress = appState.addressTab === "known";
  const commuteType = COMMUTE_TYPE_MAP[appState.commuteMode];

  const payload = {
    destAddress: isKnownAddress ? appState.commuteArea || null : null,
    guCodes: isKnownAddress ? [] : appState.commuteAreas.map((gu) => GU_CODE_MAP[gu]).filter(Boolean),
    commuteType,
    priorityCategories: appState.priorities.map((p) => PRIORITY_CODE_MAP[p]).filter(Boolean),
    essentialCategories: appState.mustHave.map((m) => MUST_HAVE_CODE_MAP[m]).filter(Boolean),
    rentalType: RENTAL_TYPE_MAP[appState.rentType],
    maxDeposit: appState.deposit,
    preferredHouseTypes: appState.housingTypes.flatMap((h) => HOUSING_CODE_MAP[h] || []),
  };

  if (isKnownAddress) {
    payload.maxCommuteTime = appState.maxCommuteTime;
    if (commuteType === "PUBLIC_TRANSIT") {
      payload.maxTransferCount = appState.maxTransfers;
    }
  }

  if (appState.rentType === "월세") {
    payload.maxRent = appState.monthly;
  }

  const minArea = parseMinArea(appState.minArea);
  if (minArea !== undefined) {
    payload.minArea = minArea;
  }

  return payload;
}
