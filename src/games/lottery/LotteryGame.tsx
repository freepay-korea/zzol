import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Users, AlertTriangle, Play, RotateCcw, Sliders, CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../../effects/sound';
import { haptics } from '../../effects/haptics';
import { triggerFireworks } from '../../effects/confetti';
import { wakeLock } from '../../effects/wakeLock';

interface LotteryGameProps {
  onBack: () => void;
}

interface CardItem {
  id: number;
  isFail: boolean;
  penaltyText?: string;
  isFlipped: boolean;
  isShaking: boolean;
}

interface SavedSettings {
  playerCount: number;
  failCount: number;
  penalties: string[];
}

const DEFAULT_PENALTIES = ['커피 쏘기 ☕', '술 한 잔 원샷 🍻', '밥값 결제 💳', '노래 한 곡 🎤', '설거지 당첨 🧼'];

const getPenaltyFontSize = (text: string) => {
  if (text.length <= 5) return 'text-xs sm:text-sm font-black';
  if (text.length <= 9) return 'text-[11px] sm:text-xs font-black';
  if (text.length <= 14) return 'text-[10px] sm:text-[11px] font-extrabold';
  return 'text-[9.5px] sm:text-[10.5px] font-bold leading-tight';
};

export const LotteryGame: React.FC<LotteryGameProps> = ({ onBack }) => {
  // Screen Wake Lock
  useEffect(() => {
    wakeLock.request();
    return () => {
      wakeLock.release();
    };
  }, []);

  // Load saved settings from localStorage
  const [playerCount, setPlayerCount] = useState<number>(() => {
    const saved = localStorage.getItem('hanpan_lottery_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.playerCount || 4;
      } catch {
        return 4;
      }
    }
    return 4;
  });

  const [failCount, setFailCount] = useState<number>(() => {
    const saved = localStorage.getItem('hanpan_lottery_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.failCount || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  });

  const [customPenalties, setCustomPenalties] = useState<string[]>(() => {
    const saved = localStorage.getItem('hanpan_lottery_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.penalties || DEFAULT_PENALTIES;
      } catch {
        return DEFAULT_PENALTIES;
      }
    }
    return DEFAULT_PENALTIES;
  });

  const [newPenaltyInput, setNewPenaltyInput] = useState('');
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'summary'>('setup');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [screenShaking, setScreenShaking] = useState(false);
  const [redFlash, setRedFlash] = useState(false);
  const [flippedFailCard, setFlippedFailCard] = useState<CardItem | null>(null);

  const handleBack = () => {
    haptics.trigger('light');
    if (gameState === 'playing') {
      setGameState('setup');
    } else {
      onBack();
    }
  };

  // Keep failCount within valid bounds
  useEffect(() => {
    if (failCount >= playerCount) {
      setFailCount(Math.max(1, playerCount - 1));
    }
  }, [playerCount, failCount]);

  // Save settings on start
  const saveSettings = (pCount: number, fCount: number, penalties: string[]) => {
    const settings: SavedSettings = {
      playerCount: pCount,
      failCount: fCount,
      penalties,
    };
    localStorage.setItem('hanpan_lottery_settings', JSON.stringify(settings));
  };

  // Start a new lottery game
  const startGame = () => {
    sounds.playButton();
    haptics.trigger('selection');
    setFlippedFailCard(null);
    saveSettings(playerCount, failCount, customPenalties);

    // Create cards with cryptographically secure random distribution
    const array = new Uint32Array(playerCount);
    crypto.getRandomValues(array);

    // Initial array of booleans (true for fail, false for pass)
    const failArray: boolean[] = Array(playerCount).fill(false);
    for (let i = 0; i < failCount; i++) {
      failArray[i] = true;
    }

    // Cryptographic shuffle
    for (let i = failArray.length - 1; i > 0; i--) {
      const j = array[i] % (i + 1);
      [failArray[i], failArray[j]] = [failArray[j], failArray[i]];
    }

    // Assign penalties
    let penaltyIdx = 0;
    const initialCards: CardItem[] = failArray.map((isFail, idx) => {
      let penaltyText = '꽝!';
      if (isFail && customPenalties.length > 0) {
        penaltyText = customPenalties[penaltyIdx % customPenalties.length];
        penaltyIdx++;
      }
      return {
        id: idx,
        isFail,
        penaltyText,
        isFlipped: false,
        isShaking: false,
      };
    });

    setCards(initialCards);
    setGameState('playing');
  };

  // Handle card click
  const handleCardClick = (cardId: number) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isShaking) return;

    sounds.playHeartbeat(1.2);
    haptics.trigger('medium');

    // Start 0.8s shake tension
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isShaking: true } : c))
    );

    setTimeout(() => {
      // Complete flip
      sounds.playCardFlip();
      const updatedCards = cards.map((c) => {
        if (c.id === cardId) {
          return { ...c, isShaking: false, isFlipped: true };
        }
        return c;
      });
      setCards(updatedCards);

      if (card.isFail) {
        // Red flash & Screen Shake & Big Popup Announcement
        sounds.playFail();
        haptics.trigger('error');
        setScreenShaking(true);
        setRedFlash(true);
        setFlippedFailCard(card);
        triggerFireworks();

        setTimeout(() => {
          setScreenShaking(false);
          setRedFlash(false);
        }, 800);

        // Auto hide popup after 2.8s
        setTimeout(() => {
          setFlippedFailCard((cur) => (cur?.id === card.id ? null : cur));
        }, 2800);
      } else {
        // Safe pass
        sounds.playPass();
        haptics.trigger('light');
      }

      // Check if all cards or all fail cards are flipped
      const remainingUnflipped = updatedCards.filter((c) => !c.isFlipped);
      const remainingFails = updatedCards.filter((c) => c.isFail && !c.isFlipped);

      if (remainingUnflipped.length === 0 || remainingFails.length === 0) {
        setTimeout(() => {
          setGameState('summary');
        }, 1800);
      }
    }, 800);
  };

  const addPenalty = () => {
    if (!newPenaltyInput.trim()) return;
    setCustomPenalties([...customPenalties, newPenaltyInput.trim()]);
    setNewPenaltyInput('');
  };

  const removePenalty = (index: number) => {
    setCustomPenalties(customPenalties.filter((_, i) => i !== index));
  };

  const remainingFails = cards.filter((c) => c.isFail && !c.isFlipped).length;
  const remainingCards = cards.filter((c) => !c.isFlipped).length;

  return (
    <div
      className={`relative w-full h-full bg-[#090a10] text-slate-100 select-none overflow-hidden flex flex-col justify-between ${
        screenShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''
      }`}
    >
      {/* Red Flash Overlay on Fail */}
      <AnimatePresence>
        {redFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Dramatic Full Penalty Announcement Banner on Flip */}
      <AnimatePresence>
        {flippedFailCard && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            onClick={() => setFlippedFailCard(null)}
            className="fixed inset-x-4 top-16 z-50 max-w-sm mx-auto p-4 rounded-3xl bg-gradient-to-b from-rose-900 to-rose-950 border-2 border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.5)] backdrop-blur-xl text-center cursor-pointer"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3.5 h-3.5 fill-white text-rose-500" />
              <span>{flippedFailCard.id + 1}번 카드 당첨 (꽝)!</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-display break-keep break-words py-1 leading-snug drop-shadow-md">
              "{flippedFailCard.penaltyText}"
            </div>
            <p className="text-[11px] text-rose-200/80 mt-1">
              (터치하면 바로 닫힙니다)
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="relative z-30 flex items-center justify-between p-3.5 bg-[#090a10]/85 backdrop-blur-md border-b border-white/5">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold hover:bg-white/10 active:scale-95 transition-all"
          aria-label={gameState === 'playing' ? '설정으로 돌아가기' : '홈으로 가기'}
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>{gameState === 'playing' ? '설정' : '홈으로'}</span>
        </button>

        <h2 className="text-sm font-bold font-display text-amber-400">
          제비뽑기
        </h2>

        {gameState === 'playing' ? (
          <button
            onClick={() => setGameState('setup')}
            className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white"
            aria-label="설정 변경"
          >
            <Sliders className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-9" />
        )}
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center">
        {/* 1. SETUP STATE */}
        {gameState === 'setup' && (
          <div className="w-full max-w-sm space-y-5 my-auto animate-fade-in">
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black font-display text-white">
                게임 설정
              </h3>
              <p className="text-xs text-slate-400">
                인원수와 꽝 개수를 맞추고 시작하세요
              </p>
            </div>

            {/* Players Stepper */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  참가 인원
                </span>
                <span className="text-lg font-bold text-amber-400 font-display">
                  {playerCount}명
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setPlayerCount(Math.max(2, playerCount - 1))}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold active:scale-95"
                >
                  -
                </button>
                {[4, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    onClick={() => setPlayerCount(n)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                      playerCount === n
                        ? 'bg-amber-400 text-black font-bold'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPlayerCount(Math.min(20, playerCount + 1))}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Fails Stepper */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  꽝 개수
                </span>
                <span className="text-lg font-bold text-rose-400 font-display">
                  {failCount}개
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setFailCount(Math.max(1, failCount - 1))}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold active:scale-95"
                >
                  -
                </button>
                {[1, 2, 3].filter((n) => n < playerCount).map((n) => (
                  <button
                    key={n}
                    onClick={() => setFailCount(n)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                      failCount === n
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-white/5 text-slate-400'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setFailCount(Math.min(playerCount - 1, failCount + 1))}
                  className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-bold active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Custom Penalty Editor */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">
                  벌칙 문구 (선택)
                </span>
                <span className="text-xs text-slate-400">
                  {customPenalties.length}개 등록됨
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {customPenalties.map((penalty, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300"
                  >
                    {penalty}
                    <button
                      onClick={() => removePenalty(idx)}
                      className="text-slate-500 hover:text-rose-400 text-xs font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newPenaltyInput}
                  onChange={(e) => setNewPenaltyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addPenalty()}
                  placeholder="예: 술 한 잔 원샷, 아이스크림 쏘기"
                  className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={addPenalty}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white"
                >
                  추가
                </button>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-base shadow-xl shadow-amber-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-black" />
              제비뽑기 시작
            </button>
          </div>
        )}

        {/* 2. PLAYING STATE */}
        {gameState === 'playing' && (
          <div className="w-full h-full flex flex-col justify-between py-2">
            {/* Status bar */}
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs mb-3">
              <span className="text-slate-300">
                남은 카드 <strong className="text-amber-400">{remainingCards}장</strong>
              </span>
              <span className="text-slate-300">
                남은 꽝 <strong className="text-rose-400">{remainingFails}개</strong>
              </span>
            </div>

            {/* Dynamic Card Grid */}
            <div
              className={`flex-1 grid gap-2.5 sm:gap-3 items-center justify-center p-1 ${
                cards.length <= 4
                  ? 'grid-cols-2 max-w-xs mx-auto'
                  : cards.length <= 6
                  ? 'grid-cols-3 max-w-sm mx-auto'
                  : cards.length <= 9
                  ? 'grid-cols-3 max-w-sm mx-auto'
                  : cards.length <= 12
                  ? 'grid-cols-3 sm:grid-cols-4 max-w-md mx-auto'
                  : 'grid-cols-4 max-w-md mx-auto'
              }`}
            >
              {cards.map((card, index) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  className={`perspective-1000 aspect-[3/4] w-full min-h-[100px] relative cursor-pointer select-none ${
                    card.isShaking ? 'animate-[shake_0.15s_ease-in-out_infinite]' : ''
                  }`}
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-style-3d rounded-2xl ${
                      card.isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* CARD BACK (Unflipped) */}
                    <div
                      className={`absolute inset-0 w-full h-full backface-hidden rounded-2xl border-2 flex flex-col items-center justify-center p-2 shadow-lg transition-all ${
                        card.isShaking
                          ? 'border-amber-400 bg-amber-950/60 shadow-amber-500/40'
                          : 'border-amber-500/30 bg-gradient-to-br from-[#1e1929] to-[#120f1c] hover:border-amber-400/60 active:scale-95'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 font-display font-black text-sm mb-1">
                        ?
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {index + 1}번
                      </span>
                    </div>

                    {/* CARD FRONT (Flipped) */}
                    <div
                      className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl border-2 flex flex-col items-center justify-between p-2 text-center shadow-xl overflow-hidden ${
                        card.isFail
                          ? 'border-rose-500 bg-gradient-to-b from-rose-950 via-rose-900 to-[#1d0b11] text-white neon-glow-rose'
                          : 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-[#0e1713] text-emerald-300'
                      }`}
                    >
                      {card.isFail ? (
                        <>
                          <div className="w-full flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-black text-rose-300 uppercase tracking-wider py-0.5 px-1.5 rounded-full bg-rose-500/25">
                            <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span>꽝 당첨!</span>
                          </div>

                          {/* Full Penalty Text: No line-clamp, break-keep, dynamic font sizing */}
                          <div className="flex-1 w-full flex items-center justify-center px-0.5 my-1">
                            <p
                              className={`text-white text-center leading-snug break-keep break-words hyphens-auto w-full ${getPenaltyFontSize(
                                card.penaltyText || ''
                              )}`}
                            >
                              {card.penaltyText || '꽝!'}
                            </p>
                          </div>

                          <span className="text-[9.5px] text-rose-400/90 font-medium">
                            벌칙 수행!
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-full flex items-center justify-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-300 py-0.5 px-1.5 rounded-full bg-emerald-500/25">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>통과!</span>
                          </div>

                          <div className="flex-1 w-full flex items-center justify-center px-1 my-1">
                            <p className="text-xs sm:text-sm font-black text-emerald-200 text-center">
                              생존 🎉
                            </p>
                          </div>

                          <span className="text-[9.5px] text-slate-400 font-medium">
                            안전 통과
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instruction Footer */}
            <p className="text-center text-xs text-slate-400 py-1">
              폰을 돌려 가며 각자 카드를 하나씩 탭하세요
            </p>
          </div>
        )}

        {/* 3. SUMMARY STATE */}
        {gameState === 'summary' && (
          <div className="w-full max-w-sm space-y-4 my-auto p-5 rounded-3xl bg-[#12141f] border border-white/10 shadow-2xl text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 mx-auto flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black font-display text-white">
                결과 발표!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                꽝에 당첨된 벌칙 대상자입니다
              </p>
            </div>

            {/* Fails summary list: completely untruncated with full word-break */}
            <div className="space-y-2 py-2 max-h-56 overflow-y-auto">
              {cards
                .filter((c) => c.isFail)
                .map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-left gap-2"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-rose-100 break-keep break-words flex-1 leading-snug">
                        {c.penaltyText || '꽝!'}
                      </span>
                    </div>
                    <span className="text-[11px] text-rose-400 font-extrabold shrink-0 px-2 py-0.5 rounded-full bg-rose-500/20">
                      벌칙
                    </span>
                  </div>
                ))}
            </div>

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={startGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-sm shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                같은 설정으로 다시 하기
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-300" />
                  홈으로
                </button>
                <button
                  onClick={() => setGameState('setup')}
                  className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-medium text-xs hover:bg-white/10 active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
                >
                  <Sliders className="w-4 h-4 text-amber-400" />
                  설정 변경
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
