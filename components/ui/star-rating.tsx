"use client";
import { Star, StarHalf } from "lucide-react";
import { useState } from "react";

export function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const dim = { width: size, height: size };

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const full = display >= i;
        const half = !full && display >= i - 0.5;
        return (
          <div key={i} className="relative" style={dim}>
            <Star className="absolute inset-0 text-zinc-700" style={dim} />
            {full && <Star className="absolute inset-0 text-amber-400 fill-amber-400" style={dim} />}
            {half && <StarHalf className="absolute inset-0 text-amber-400 fill-amber-400" style={dim} />}
            {!readOnly && (
              <>
                <button
                  type="button"
                  aria-label={`${i - 0.5} estrelas`}
                  className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer"
                  onMouseEnter={() => setHover(i - 0.5)}
                  onClick={() => onChange?.(i - 0.5)}
                />
                <button
                  type="button"
                  aria-label={`${i} estrelas`}
                  className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer"
                  onMouseEnter={() => setHover(i)}
                  onClick={() => onChange?.(i)}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
