import React from "react";
import { useArtboardStore } from "../store/artboard";

export const Picture: React.FC<{ className?: string; size?: number }> = ({ className, size = 72 }) => {
  const basics = useArtboardStore((s) => s.resume.basics);
  if (!basics.picture) return null;
  return (
    <img
      src={basics.picture}
      alt={basics.name}
      style={{ width: size, height: size }}
      className={`rounded-full object-cover ${className ?? ""}`.trim()}
    />
  );
};
