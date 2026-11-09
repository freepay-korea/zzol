# 쫄? (ZZOL?) - 광고 없는 친구 모임 내기 앱

> **친구 모임 · 간식 내기 · 순서 정하기!**  
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

본 프로젝트는 **구글 플레이스토어 출시 기준(Target SDK 36, Android App Bundle .aab, PWA TWA 규격)**에 맞춰 완벽히 세팅되어 있습니다. 다음 2가지 방법 중 편한 방법을 선택하세요.

### 방법 0: GitHub Actions로 서명된 .aab 자동 빌드 (가장 추천 ⭐️ - PC에 아무것도 설치 불필요)

`.github/workflows/android-release.yml` 워크플로가 Capacitor 네이티브 앱을 빌드하고 서명된 `.aab`를 만들어 줍니다.
스토어 등록 문구·스크린샷·그래픽 이미지는 [`store/`](store/LISTING.md) 폴더에 준비되어 있습니다.

#### ① 업로드 키 준비
이미 Play Console에 v1.0.0을 올릴 때 쓴 **`zzol-upload.jks` (alias `zzol-upload`)** 가 등록된 업로드 키입니다. **새로 만들지 말고 이 파일을 그대로 사용하세요.** (다른 키로 서명하면 Play Console이 업로드를 거부합니다.)
```bash
base64 -w0 zzol-upload.jks > keystore.b64   # macOS: base64 -i zzol-upload.jks -o keystore.b64
# Windows PowerShell: [Convert]::ToBase64String([IO.File]::ReadAllBytes("zzol-upload.jks")) | Set-Content keystore.b64
```
> ⚠️ 키 파일은 저장소에 커밋하지 말고 안전한 곳에 백업하세요.

#### ② GitHub 시크릿 등록
저장소 **Settings → Secrets and variables → Actions → New repository secret**

| 이름 | 값 |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | `keystore.b64` 파일 내용 전체 |
| `ANDROID_KEYSTORE_PASSWORD` | 키스토어 비밀번호 |
| `ANDROID_KEY_ALIAS` | `zzol-upload` |
| `ANDROID_KEY_PASSWORD` | 키 비밀번호 (보통 키스토어 비밀번호와 동일) |

#### ③ 빌드 실행
**Actions → Android Release (AAB) → Run workflow** → 버전 이름(예: `1.0.0`) 입력 후 실행.
완료되면 실행 화면 하단 **Artifacts**에서 `app-release.aab`를 내려받습니다.
버전 코드는 Play Console에 올린 적 있는 값보다 커야 합니다 (v1.0.0 = 1은 이미 업로드됨 → 다음은 2).

#### ④ Play Console 업로드
1. [Play Console](https://play.google.com/console)에서 앱 만들기 → 앱 이름 `쫄?`, 게임, 무료
2. [`store/LISTING.md`](store/LISTING.md)를 보고 스토어 등록정보·앱 콘텐츠(개인정보처리방침, 콘텐츠 등급, 데이터 보안 등) 작성
3. **테스트 및 출시**에서 `.aab` 업로드 (Play 앱 서명 사용 동의)
4. **2023년 11월 이후 만든 개인 개발자 계정**은 프로덕션 출시 전에 **비공개 테스트에 12명 이상이 14일 이상 참여**해야 합니다. 비공개 테스트 트랙에 먼저 올려 테스터를 모으세요.

---

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
