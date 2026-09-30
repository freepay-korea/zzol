import React, { useEffect } from 'react';
import { ArrowLeft, RotateCcw, Users, Trophy } from 'lucide-react';
import { useFingerGame, FingerGameMode } from './useFingerGame';
import { FingerCanvas } from './FingerCanvas';
import { wakeLock } from '../../effects/wakeLock';
import { haptics } from '../../effects/haptics';
import { strings } from '../../locales/strings';

interface FingerGameProps {
  onBack: () => void;
}

export const FingerGame: React.FC<FingerGameProps> = ({ onBack }) => {
  const {
    mode,
    setMode,
    winnerCount,
    setWinnerCount,
    teamCount,
    setTeamCount,
    gameState,
    countdownValue,
    fingers,
    resetGame,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handlePointerDown,
  } = useFingerGame();

  // Screen Wake Lock
  useEffect(() => {
    wakeLock.request();
    return () => {
      wakeLock.release();
    };
  }, []);

  const handleBack = () => {
    haptics.trigger('light');
    resetGame();
    onBack();
  };

  const handleModeChange = (newMode: FingerGameMode) => {
    haptics.trigger('selection');
    setMode(newMode);
    resetGame();
  };

  return (
    <div
      className="relative w-full h-full bg-[#090a10] select-none overflow-hidden touch-none flex flex-col justify-between"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onPointerDown={handlePointerDown}
    >
      {/* 60fps Canvas Particle & Rings Layer */}
      <FingerCanvas
        fingers={fingers}
        gameState={gameState}
        countdownValue={countdownValue}
      />

      {/* Top Header Bar */}
      <header
        className="interactive-zone relative z-30 flex items-center justify-between p-3.5 bg-[#090a10]/90 backdrop-blur-md border-b border-white/5"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {/* Back to Home Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold hover:bg-white/10 active:scale-95 transition-all"
          aria-label="홈으로 가기"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>홈으로</span>
        </button>

        {/* Mode Selector */}
        <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
          <button
            onClick={() => handleModeChange('single')}
            className={`px-2.5 py-1 text-xs font-medium rounded-xl transition-all ${
              mode === 'single'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            1명 당첨
          </button>
          <button
            onClick={() => handleModeChange('multiple')}
            className={`px-2.5 py-1 text-xs font-medium rounded-xl transition-all ${
              mode === 'multiple'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            N명 당첨
          </button>
          <button
            onClick={() => handleModeChange('teams')}
            className={`px-2.5 py-1 text-xs font-medium rounded-xl transition-all ${
              mode === 'teams'
                ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            팀 나누기
          </button>
        </div>

        {/* Quick Reset Button */}
        <button
          onClick={resetGame}
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-transform"
          aria-label="다시 하기"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </header>

      {/* Sub-controls for N winners or Team count */}
      {mode === 'multiple' && (
        <div
          className="interactive-zone relative z-30 mx-auto mt-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 text-xs"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <span className="text-slate-400">당첨 인원:</span>
          <button
            onClick={() => setWinnerCount(Math.max(1, winnerCount - 1))}
            className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white active:scale-90 font-bold"
          >
            -
          </button>
          <span className="font-bold text-cyan-400 min-w-4 text-center">{winnerCount}명</span>
          <button
            onClick={() => setWinnerCount(Math.min(9, winnerCount + 1))}
            className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-white active:scale-90 font-bold"
          >
            +
          </button>
        </div>
      )}

      {mode === 'teams' && (
        <div
          className="interactive-zone relative z-30 mx-auto mt-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-3 text-xs"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <span className="text-slate-400">팀 수:</span>
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setTeamCount(n)}
              className={`px-2.5 py-0.5 rounded-md font-bold transition-all ${
                teamCount === n
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-white/5 text-slate-300'
              }`}
            >
              {n}팀
            </button>
          ))}
        </div>
      )}

      {/* Center Guidance / Status Display */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center pointer-events-none p-4">
        {gameState === 'waiting' && fingers.length === 0 && (
          <div className="text-center space-y-3 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 mx-auto flex items-center justify-center text-cyan-400">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              {strings.finger.instructionWaiting}
            </h2>
            <p className="text-xs text-slate-400">
              손가락 2개 이상을 올려놓고 2초간 유지하면 시작됩니다
            </p>
          </div>
        )}

        {gameState === 'waiting' && fingers.length === 1 && (
          <div className="text-center space-y-2 animate-bounce">
            <p className="text-base font-semibold text-cyan-300">
              한 명 더 올려주세요! (최소 2명)
            </p>
          </div>
        )}

        {gameState === 'stabilizing' && (
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold font-display text-cyan-300 animate-pulse">
              손 떼지 마세요!
            </div>
            <p className="text-xs text-slate-400">
              참가자 {fingers.length}명 인식 완료 · 2초 안정화 중...
            </p>
          </div>
        )}

        {gameState === 'countdown' && (
          <div className="text-center">
            <div className="text-8xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 scale-125 animate-ping">
              {countdownValue}
            </div>
            <p className="text-xs font-semibold text-cyan-300 tracking-widest mt-4 uppercase">
              결과 발표 직전!
            </p>
          </div>
        )}

        {/* Result Dialog with explicit Return to Home button */}
        {gameState === 'result' && (
          <div
            className="interactive-zone text-center space-y-4 bg-[#12141f]/95 p-6 rounded-3xl border border-white/15 backdrop-blur-xl shadow-2xl animate-fade-in pointer-events-auto max-w-xs w-full"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-cyan-400 p-[1.5px] mx-auto">
              <div className="w-full h-full bg-[#090a10] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black font-display text-white">
                {mode === 'teams'
                  ? '팀 나누기 완료!'
                  : mode === 'multiple'
                  ? `당첨자 ${fingers.filter((f) => f.isWinner).length}명 확정!`
                  : '당첨자 확정! 🎉'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                {mode === 'teams'
                  ? '화면의 색상과 팀 번호를 확인하세요'
                  : '빛나는 네온 링의 주인이 당첨자입니다!'}
              </p>
            </div>

            {/* Action Buttons: Home & Replay */}
            <div className="pt-2 flex items-center gap-2.5">
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 text-slate-300" />
                <span>홈으로</span>
              </button>
              <button
                onClick={resetGame}
                className="flex-1 py-3 px-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs shadow-lg shadow-cyan-500/30 active:scale-95 transition-transform flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>한판 더</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <footer className="relative z-20 pb-4 text-center text-[11px] text-slate-500 pointer-events-none">
        {gameState !== 'result' && (
          <p>화면 아무 곳이나 손가락을 대고 기다리세요</p>
        )}
      </footer>
    </div>
  );
};
