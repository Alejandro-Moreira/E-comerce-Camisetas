import { useState } from 'react';

const StarSVG = ({ filled, half, className = "" }) => {
  return (
    <svg 
      className={`w-6 h-6 transition-all duration-200 ${className}`} 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {half ? (
        <defs>
          <linearGradient id="half-gradient">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
      ) : null}
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        fill={half ? "url(#half-gradient)" : undefined}
      />
    </svg>
  );
};

export const StarRating = ({ 
  rating = 0, 
  readOnly = false, 
  onRatingChange, 
  sizeClass = "w-6 h-6" 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center group">
      {[1, 2, 3, 4, 5].map((starValue) => {
        const isFilled = currentRating >= starValue;
        const isHalf = !isFilled && Math.ceil(currentRating) === starValue;

        return (
          <button
            key={starValue}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onRatingChange && onRatingChange(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`
              focus:outline-none 
              ${readOnly ? 'cursor-default' : 'cursor-pointer'}
              ${(isFilled || isHalf) ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300'}
              ${!readOnly && 'hover:scale-110'}
            `}
          >
            <StarSVG 
              filled={isFilled} 
              half={isHalf} 
              className={sizeClass} 
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
