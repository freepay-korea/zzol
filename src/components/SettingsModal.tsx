import React, { useState } from 'react';
import { X, Volume2, VolumeX, Smartphone, Info, Share2, Check, ExternalLink } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { haptics } from '../effects/haptics';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { soundEnabled, hapticEnabled, toggleSound, toggleHaptic } = useSettingsStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    haptics.trigger('light');
    toggleSound();
  };

  const handleToggleHaptic = () => {
    toggleHaptic();
    if (!hapticEnabled) {
      setTimeout(() => haptics.trigger('medium'), 50);
    }
  };

  const handleClose = () => {
    haptics.trigger('light');
    onClose();
  };

  const handleShareApp = async () => {
    haptics.trigger('selection');
    const shareData = {
      title: '쫄? - 광고 없는 친구 내기 앱',
      text: '친구 모임, 밥값 내기, 순서 정하기! 폰 하나로 3초 만에 시작하는 화려한 터치 내기 게임',
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled share or failed, fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="설정"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-[#12141f] border border-white/10 p-6 shadow-2xl space-y-5 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-white">설정</h3>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white active:scale-95 transition-transform"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Setting Items */}
        <div className="space-y-3">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">효과음</p>
                <p className="text-xs text-slate-400">카운트다운 및 결과 효과음</p>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptic Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">진동 피드백</p>
                <p className="text-xs text-slate-400">터치 및 당첨 순간 햅틱</p>
              </div>
            </div>
            <button
              onClick={handleToggleHaptic}
              type="button"
              role="switch"
              aria-checked={hapticEnabled}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                hapticEnabled ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  hapticEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Share / Copy App Link */}
          <button
            onClick={handleShareApp}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] active:scale-[0.98] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {copied ? '링크 복사 완료!' : '홈페이지 공유하기'}
                </p>
                <p className="text-xs text-slate-400">
                  {copied ? '클립보드에 주소가 복사되었습니다' : '친구들에게 웹앱 주소 공유하기'}
                </p>
              </div>
            </div>
            <span className="text-xs text-cyan-400 font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10">
              {copied ? '완료' : '공유'}
            </span>
          </button>
        </div>

        {/* App Info & GitHub Publishing Guide */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              <span>쫄? v1.0.0 (광고 없음)</span>
            </div>
            <span className="text-emerald-400 font-medium">PWA & GitHub 연동 지원</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            브라우저 메뉴에서 [홈 화면에 추가]를 누르면 앱처럼 전체 화면으로 즐길 수 있습니다.
          </p>
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-transform"
        >
          확인
        </button>
      </div>
    </div>
  );
};
