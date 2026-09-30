import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
const Carousel = ({
  children,
  autoPlay = false,
  interval = 5e3,
  showIndicators = true,
  showArrows = true,
  className = "",
  slideClassName = ""
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const totalSlides = React.Children.count(children);
  const timerRef = useRef(null);
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => prev === totalSlides - 1 ? 0 : prev + 1);
  }, [totalSlides]);
  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => prev === 0 ? totalSlides - 1 : prev - 1);
  }, [totalSlides]);
  useEffect(() => {
    if (autoPlay && !isPaused && totalSlides > 1) {
      timerRef.current = setInterval(nextSlide, interval);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPlay, isPaused, interval, nextSlide, totalSlides]);
  if (totalSlides === 0) return null;
  return <div
    className={`relative overflow-hidden rounded-2xl group ${className}`}
    onMouseEnter={() => setIsPaused(true)}
    onMouseLeave={() => setIsPaused(false)}
    role="region"
    aria-label="Image Carousel"
  >
      {
    /* Slides container */
  }
      <div
    className="flex transition-transform duration-500 ease-out h-full"
    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
  >
        {React.Children.map(children, (child, idx) => <div
    key={idx}
    className={`w-full flex-shrink-0 flex-grow-0 ${slideClassName}`}
    aria-hidden={currentIndex !== idx}
  >
            {child}
          </div>)}
      </div>

      {
    /* Prev / Next Arrows */
  }
      {showArrows && totalSlides > 1 && <>
          <button
    type="button"
    onClick={prevSlide}
    aria-label="Previous slide"
    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 hover:bg-surface text-foreground shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer z-10"
  >
            <ChevronLeft size={20} />
          </button>
          <button
    type="button"
    onClick={nextSlide}
    aria-label="Next slide"
    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-surface/80 hover:bg-surface text-foreground shadow-md backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-105 cursor-pointer z-10"
  >
            <ChevronRight size={20} />
          </button>
        </>}

      {
    /* Dots / Indicators */
  }
      {showIndicators && totalSlides > 1 && <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
          {Array.from({ length: totalSlides }).map((_, idx) => <button
    key={idx}
    type="button"
    onClick={() => setCurrentIndex(idx)}
    aria-label={`Go to slide ${idx + 1}`}
    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${currentIndex === idx ? "w-6 bg-primary" : "w-2 bg-border hover:bg-muted"}`}
  />)}
        </div>}
    </div>;
};
var stdin_default = Carousel;
export {
  Carousel,
  stdin_default as default
};
