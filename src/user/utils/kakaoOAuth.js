const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";

export function getKakaoAuthorizeUrl() {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID;
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;

  console.log('Kakao clientId:', clientId)
  console.log('Kakao redirectUri:', redirectUri)

  window.location.href =
    'https://kauth.kakao.com/oauth/authorize' +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    '&response_type=code'

  if (!clientId || !redirectUri) {
    throw new Error(
      "VITE_KAKAO_CLIENT_ID와 VITE_KAKAO_REDIRECT_URI를 설정해 주세요.",
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  return `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;
}

export function startKakaoOAuth() {
  try {
    window.location.assign(getKakaoAuthorizeUrl());
  } catch (error) {
    console.error("카카오 OAuth 설정 오류:", error);
    window.alert(error.message);
  }
}
