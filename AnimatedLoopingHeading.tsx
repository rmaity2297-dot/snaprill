import React, { useState, useEffect } from 'react';

interface AnimatedLoopingHeadingProps {
  text?: string;
  className?: string;
}

export const AnimatedLoopingHeading: React.FC<AnimatedLoopingHeadingProps> = ({
  text = 'Download Reels & Shorts in High Definition',
  className = '',
}) => {
  const words = text.split(' ').filter(Boolean);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (visibleCount < words.length) {
      // Reveal next word every 280ms
      timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 280);
    } else {
      // All words are revealed: hold readable state for 2200ms
      timer = setTimeout(() => {
        setIsFadingOut(true);
        // Quick gentle fade out before restarting from word 1
        setTimeout(() => {
          setVisibleCount(1);
          setIsFadingOut(false);
        }, 350);
      }, 2400);
    }

    return () => clearTimeout(timer);
  }, [visibleCount, words.length, text]);

  // When text changes, reset smoothly
  useEffect(() => {
    setVisibleCount(1);
    setIsFadingOut(false);
  }, [text]);

  return (
    <h1
      className={`text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-tight min-h-[4.2rem] sm:min-h-[4.8rem] md:min-h-[5.2rem] flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1.5 select-none ${className}`}
      aria-label={text}
    >
      {words.map((word, idx) => {
        const isVisible = !isFadingOut && idx < visibleCount;
        const isHighlight =
          word.toLowerCase() === 'high' ||
          word.toLowerCase() === 'definition' ||
          word.toLowerCase() === 'shorts' ||
          word.toLowerCase() === 'reels';

        return (
          <span
            key={`${word}-${idx}`}
            className={`inline-block transition-all duration-300 ease-out transform ${
              isVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
            } ${
              isHighlight
                ? 'shimmer-gradient-text drop-shadow-[0_0_15px_rgba(244,63,94,0.35)]'
                : 'text-white'
            }`}
            aria-hidden={!isVisible}
          >
            {word}
          </span>
        );
      })}

      {/* Subtle modern glowing indicator with fixed layout space so it never displaces text */}
      <span
        className={`inline-block w-[3px] h-6 sm:h-8 bg-rose-500 rounded-full transition-all duration-300 ${
          visibleCount >= words.length ? 'opacity-40 animate-pulse' : 'opacity-100 shadow-[0_0_8px_rgba(244,63,94,0.8)]'
        }`}
        aria-hidden="true"
      />
    </h1>
  );
};

