import React from "react";

export const BrandIcon: React.FC<{ slug?: string; className?: string }> = ({ slug, className }) => {
  if (!slug) return null;
  // Fallback: use phosphor icon naming if available in your app css
  return <i className={`ph ph-bold ph-${slug} ${className ?? ""}`.trim()} aria-hidden />;
};
