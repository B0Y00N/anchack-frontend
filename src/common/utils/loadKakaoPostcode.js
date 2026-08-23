let kakaoPostcodePromise = null;

export const loadKakaoPostcode = () => {
  if (window.kakao?.Postcode) {
    return Promise.resolve(window.kakao.Postcode);
  }

  if (kakaoPostcodePromise) {
    return kakaoPostcodePromise;
  }

  kakaoPostcodePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");

    script.src = "https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;

    script.onload = () => {
      if (window.kakao?.Postcode) {
        resolve(window.kakao.Postcode);
        return;
      }

      kakaoPostcodePromise = null;
      reject(new Error("카카오 우편번호 서비스를 초기화하지 못했습니다."));
    };

    script.onerror = () => {
      kakaoPostcodePromise = null;
      reject(new Error("카카오 우편번호 서비스를 불러오지 못했습니다."));
    };

    document.head.appendChild(script);
  });

  return kakaoPostcodePromise;
};
