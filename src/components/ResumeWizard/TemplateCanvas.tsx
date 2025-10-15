import React, { useEffect } from 'react';

// A4 at ~96 DPI ≈ 794 x 1123 pixels
export const CANVAS_WIDTH_PX = 794;
export const CANVAS_HEIGHT_PX = 1123;

interface TemplateCanvasProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Fixed-size A4 canvas wrapper for resume templates.
 * Ensures every template renders into a consistent 794x1123px canvas
 * so preview/fit logic remains identical across templates.
 */
export const TemplateCanvas: React.FC<TemplateCanvasProps> = ({ children, className = '', style }) => {
 
  useEffect(() => {
   
  }, []);
  return (
    <div
      className={`relative ${className}`}
      style={{
        width: CANVAS_WIDTH_PX,
        height: CANVAS_HEIGHT_PX,
        backgroundColor: '#ffffff',
        boxShadow: '0 0 0 1px #e5e7eb, 0 10px 15px rgba(0,0,0,0.05)',
        margin: '0 auto',
        flex: '0 0 auto', // prevent flexbox parents from shrinking/growing the canvas
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
