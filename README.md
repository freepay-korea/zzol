# 쫄? (ZZOL?) - 광고 없는 친구 모임 내기 앱

> **술자리 · 밥값 내기 · 순서 정하기!**  
> 광고 없이 3초 만에 시작하는 화려한 모바일 터치 내기 게임

---

## 🎮 포함된 게임
1. **손가락 뽑기 (핵심)**
   - 2~10명 멀티터치 실시간 인식
   - 손가락별 10색 네온 원 & 2초 안정화 후 3초 카운트다운
   - `crypto.getRandomValues` 기반 공정 무작위 추첨
   - 모드: 1명 당첨 / N명 당첨 / 팀 나누기(2~4팀)
   - 손가락 위치를 가리지 않는 상·하단 스마트 UI & 👑 당첨 네온 링 배지
   - 60fps Canvas 파티클 폭발 & 진동 햅틱

2. **제비뽑기**
   - 2~20명 참가 인원 설정 & 꽝 개수 조절
   - 커스텀 벌칙 문구 입력 및 설정 자동 저장 (글자 수 자동 축소 스케일링)
   - 0.8초 텐션 떨림 후 3D 카드 뒤집기
   - 꽝 당첨 시 화면 진동 흔들림 + 붉은 플래시 + 폭죽 효과음 + 상단 대형 팝업 배너

---

## 🛍️ 구글 플레이스토어(Google Play Console) 출시 가이드

본 프로젝트는 **구글 플레이스토어 출시 기준(Target SDK 34, Android App Bundle .aab, PWA TWA 규격)**에 맞춰 완벽히 세팅되어 있습니다. 다음 2가지 방법 중 편한 방법을 선택하세요.

### 방법 1: PWABuilder 사용 (추천 ⭐️ - 안드로이드 스튜디오 설치 불필요, 3분 완성)

1. 배포된 웹사이트 주소(예: GitHub Pages 주소 `https://<아이디>.github.io/<저장소명>/`)를 복사합니다.
2. **[PWABuilder.com](https://www.pwabuilder.com/)**에 접속하여 URL을 입력하고 **Start**를 누릅니다.
3. 모든 PWA 점수(Manifest, Icons, Service Worker)가 통과(Green)됩니다.
4. **[Package for Stores]** → **Google Play** 클릭
5. 패키지명(`com.zzol.app`), 앱 이름(`쫄?`)을 확인하고 **Generate Package**를 클릭합니다.
6. 다운로드된 `.zip` 파일 안의 **`.aab` (Android App Bundle)** 파일을 구글 플레이 콘솔에 업로드하면 끝납니다!

---

### 방법 2: Capacitor 안드로이드 네이티브 빌드 (개발자 권장)

본 프로젝트의 루트 디렉토리에 **`android/`** 네이티브 프로젝트가 이미 완벽하게 생성 및 동기화되어 있습니다.

#### 세팅된 기본 정보
- **앱 ID (Package Name)**: `com.zzol.app`
- **앱 이름**: `쫄?`
- **필수 권한**: 진동(`VIBRATE`), 절전 모드 방지(`WAKE_LOCK`), 인터넷(`INTERNET`)
- **화면 방향**: 세로 고정 (`portrait`)
- **아이콘**: 모든 해상도(mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) 런처 아이콘 탑재 완료

#### .aab 빌드 순서
```bash
# 1. 최신 웹 빌드 및 안드로이드 프로젝트 동기화
npm run android:sync

# 2. 안드로이드 스튜디오에서 프로젝트 열기
npm run android:open
# 또는 Android Studio 실행 후 이 프로젝트의 'android' 폴더 열기
```

3. **Android Studio** 상단 메뉴에서:
   - **Build** → **Generate Signed Bundle / APK...** 선택
   - **Android App Bundle (.aab)** 선택 후 Next
   - 키스토어(Keystore) 생성 또는 선택 후 **release** 빌드
4. 생성된 **`app-release.aab`** 파일을 [Google Play Console](https://play.google.com/console)의 **프로덕션** 트랙에 업로드하시면 됩니다!

---

## 🚀 GitHub Pages 무료 웹 배포

저장소의 `.github/workflows/deploy.yml`을 통해 푸시할 때마다 웹사이트가 자동 배포됩니다.
- GitHub 저장소 **Settings** → **Pages** → **Source**를 `GitHub Actions`로 설정하세요.
