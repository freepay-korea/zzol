# 쫄? (ZZOL?) - 광고 없는 친구 모임 내기 웹앱

> **술자리 · 밥값 내기 · 순서 정하기!**  
> 광고 없이 3초 만에 시작하는 화려한 모바일 터치 내기 게임

---

## 🎮 포함된 게임
1. **손가락 뽑기 (핵심)**
   - 2~10명 멀티터치 실시간 인식
   - 손가락별 10색 네온 원 & 2초 안정화 후 3초 카운트다운
   - `crypto.getRandomValues` 기반 무작위 공정 추첨
   - 모드: 1명 당첨 / N명 당첨 / 팀 나누기(2~4팀)
   - 60fps Canvas 파티클 폭발 & 진동 햅틱

2. **제비뽑기**
   - 2~20명 참가 인원 설정 & 꽝 개수 조절
   - 커스텀 벌칙 문구 입력 및 설정 자동 저장
   - 0.8초 텐션 떨림 후 3D 카드 뒤집기
   - 꽝 당첨 시 화면 진동 흔들림 + 붉은 플래시 + 폭죽 효과음

---

## 🚀 1. GitHub 연동 및 GitHub Pages 무료 배포 방법

본 프로젝트에는 `.github/workflows/deploy.yml` 파일이 포함되어 있어, GitHub에 푸시만 하면 자동으로 웹사이트가 빌드 및 배포됩니다.

### 단계:
1. GitHub에서 새 저장소(Repository) 생성 (예: `zzol`)
2. 로컬 또는 현재 코드를 해당 저장소에 푸시:
   ```bash
   git init
   git add .
   git commit -m "feat: 쫄! 내기 앱 초기 배포"
   git branch -M main
   git remote add origin https://github.com/<본인-아이디>/<저장소-이름>.git
   git push -u origin main
   ```
3. GitHub 저장소의 **Settings** → **Pages** 이동
4. **Build and deployment** 항목의 **Source**를 `GitHub Actions`로 선택
5. 푸시가 완료되면 자동으로 GitHub Actions가 동작하여 `https://<본인-아이디>.github.io/<저장소-이름>/` 주소로 홈페이지가 무료 발행됩니다!

---

## 📱 2. Capacitor로 스마트폰 앱(APK/iOS) 포장하기

`capacitor.config.json` 설정이 이미 구성되어 있어 몇 줄의 명령어로 실제 모바일 앱 프로젝트로 변환할 수 있습니다.

```bash
# 1. 의존성 설치
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# 2. 웹 빌드
npm run build

# 3. 플랫폼 추가
npx cap add android
npx cap add ios

# 4. 소스 동기화
npx cap sync

# 5. 안드로이드 스튜디오 / Xcode 열기
npx cap open android
# 또는
npx cap open ios
```
안드로이드 스튜디오에서 **Build APK**를 누르면 스마트폰에 바로 설치 가능한 `.apk` 파일이 생성됩니다.

---

## 🌐 3. PWA (홈 화면에 바로 추가)

별도 스토어 다운로드 없이 브라우저(Safari, Chrome, Samsung Internet)에서:
1. 공유 또는 메뉴(⋮) 버튼 클릭
2. **[홈 화면에 추가]** 선택
3. 스마트폰 바탕화면에 앱 아이콘이 생기며 주소창 없는 전체 화면 네이티브 앱처럼 실행됩니다.

---

## 🛠️ 기술 스택
- **프론트엔드**: React 19, TypeScript, Vite 8, Tailwind CSS v4
- **애니메이션 & 비주얼**: Framer Motion, 60fps Canvas API, canvas-confetti
- **사운드 & 진동**: Web Audio API 무손실 신디사이저, Capacitor 호환 햅틱 인터페이스
- **상태 관리**: Zustand (localStorage 자동 저장)
- **배포 & 패키징**: GitHub Actions, PWA Manifest, Capacitor Ready
