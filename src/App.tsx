import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Hand, Ticket, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { FingerGame } from './games/finger/FingerGame';
import { LotteryGame } from './games/lottery/LotteryGame';
import { SettingsModal } from './components/SettingsModal';
import { haptics } from './effects/haptics';

type Screen = 'home' | 'finger' | 'lottery';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigateTo = (screen: Screen) => {
    haptics.trigger('selection');
    setCurrentScreen(screen);
  };

  const openSettings = () => {
    haptics.trigger('light');
    setIsSettingsOpen(true);
  };

  return (
    <div className="relative w-full h-full max-w-md mx-auto bg-[#090a10] text-slate-100 flex flex-col justify-between overflow-hidden">
      {/* Background ambient neon glows */}
      <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

      {/* Screen Routing */}
      {currentScreen === 'finger' && (
        <FingerGame onBack={() => navigateTo('home')} />
      )}

      {currentScreen === 'lottery' && (
        <LotteryGame onBack={() => navigateTo('home')} />
      )}

      {currentScreen === 'home' && (
        <div className="relative z-10 flex flex-col h-full justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
          {/* Top Bar */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-amber-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#090a10] rounded-[10px] flex items-center justify-center">
                  <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black font-display tracking-tight text-white flex items-center gap-1.5">
                  쫄? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-cyan-300">NO ADS</span>
                </h1>
              </div>
            </div>

            <button
              onClick={openSettings}
              className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-90 transition-transform"
              aria-label="설정 열기"
            >
              <Settings className="w-5 h-5" />
            </button>
          </header>

          {/* Hero Title */}
          <div className="my-auto py-2">
            <div className="space-y-1 text-center mb-6">
              <p className="text-xs uppercase tracking-widest text-cyan-400 font-semibold flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                술자리 · 밥값 내기 · 순서 정하기
              </p>
              <h2 className="text-3xl font-extrabold text-white font-display tracking-tight text-balance">
                폰 한 대로 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">3초 만에 승부</span>
              </h2>
              <p className="text-xs text-slate-400">
                광고 없이 바로 시작하는 화려한 터치 내기
              </p>
            </div>

            {/* Game Cards (2 MVP games) */}
            <div className="space-y-4">
              {/* Game 1: 손가락 뽑기 */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigateTo('finger')}
                className="w-full relative group text-left rounded-3xl p-5 bg-gradient-to-b from-[#141829] to-[#0f121f] border border-cyan-500/30 hover:border-cyan-400/60 shadow-xl shadow-cyan-950/40 transition-colors overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
                
                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner">
                      <Hand className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white font-display">손가락 뽑기</h3>
                        <span className="text-[11px] font-medium text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full">
                          대표 게임
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        화면에 손가락을 올리고 3초 카운트다운!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-300 font-semibold">2~10명</span>
                    <span>·</span>
                    <span>당첨 1명 / N명 / 팀 나누기</span>
                  </div>
                  <span className="text-cyan-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    시작하기 →
                  </span>
                </div>
              </motion.button>

              {/* Game 2: 제비뽑기 */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => navigateTo('lottery')}
                className="w-full relative group text-left rounded-3xl p-5 bg-gradient-to-b from-[#1c1722] to-[#121019] border border-amber-500/30 hover:border-amber-400/60 shadow-xl shadow-amber-950/40 transition-colors overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

                <div className="flex items-start justify-between relative z-10">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-400/30 flex items-center justify-center text-amber-300 shadow-inner">
                      <Ticket className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white font-display">제비뽑기</h3>
                        <span className="text-[11px] font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                          카드 뒤집기
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        카드를 한 장씩 탭해서 꽝·벌칙 확인!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-300 font-semibold">2~20명</span>
                    <span>·</span>
                    <span>꽝 개수 / 벌칙 직접 입력</span>
                  </div>
                  <span className="text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform">
                    시작하기 →
                  </span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <footer className="pt-2 flex items-center justify-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>완전 무료 · 광고 없음</span>
            </div>
            <span>·</span>
            <span>로그인 없이 바로 시작</span>
          </footer>
        </div>
      )}

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
