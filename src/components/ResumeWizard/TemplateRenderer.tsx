import React from 'react';
import { ModernProfessional } from './templates/ModernProfessional';
import { CanvaBWClean } from './templates/CanvaBWClean';
import { ThreeToneCleanSortable } from './templates/ThreeToneCleanSortable';
import { TemplateCanvas } from './TemplateCanvas';
import { registerTemplate, getTemplate, isRegistryInitialized, markRegistryInitialized } from './TemplateRegistry';

export interface TemplateRendererProps {
  resumeData: any;
}

// Initialize default templates once
function initDefaultTemplates() {
  if (isRegistryInitialized()) return;
 
  registerTemplate({
    id: 'modern-professional',
    slug: ['modern-professional'],
    label: 'Modern Professional',
    component: ModernProfessional,
    aliases: ['1', 'modernprofessional']
  });
  registerTemplate({
    id: 'black-white-clean',
    slug: ['black-white-clean'],
    label: 'Black & White Clean',
    component: CanvaBWClean,
    aliases: ['2', 'blackwhiteclean', 'bw-clean']
  });
  registerTemplate({
    id: 'three-tone-clean-sortable',
    slug: ['three-tone-clean-sortable'],
    label: 'Three Tone Clean (Sortable)',
    component: ThreeToneCleanSortable,
    aliases: ['3', 'threetoneclean']
  });
  
  // Register imported reactive-resume template wrappers
  
  markRegistryInitialized();
  
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ resumeData }) => {
  initDefaultTemplates();
 
  const tpl = resumeData?.template || {};
 
 
  const toSlug = (s?: string | number | null) => {
    if (s === undefined || s === null) return '';
    return String(s)
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };
  const tryKeys = [
    String(tpl?.slug || tpl?.id || ''),
    tpl?.template || tpl?.id ? undefined : 'modernprofessional',
    (tpl?.slug ? String(tpl.slug).toLowerCase() : undefined),
    toSlug(tpl.name),
    typeof tpl.id === 'number' ? String(tpl.id) : undefined,
  ].filter(Boolean) as string[];
  

  let entry = undefined as ReturnType<typeof getTemplate> | undefined;
  for (const k of tryKeys) {
    entry = getTemplate(k);
    if (entry) break;
  }
  // Numeric alias fallback
  if (!entry && typeof tpl?.id === 'number') {
    const numeric = String(tpl.id);
    entry = getTemplate(numeric);
  }
  // Default fallback
  if (!entry) entry = getTemplate('modernprofessional');
 
  const Comp = entry?.component || ModernProfessional;
  
  // Extract page settings for dynamic canvas sizing
  const getPageSizePx = (pageSettings: any | undefined) => {
    const size = (pageSettings?.size || pageSettings?.format || "a4").toString().toLowerCase();
    const orientation = (pageSettings?.orientation || "portrait").toString().toLowerCase();
    // Base at ~96dpi
    const sizes: Record<string, { w: number; h: number }> = {
      a4: { w: 794, h: 1123 },
      letter: { w: 816, h: 1056 },
    };
    const base = sizes[size] || sizes.a4;
    const w = orientation === "landscape" ? base.h : base.w;
    const h = orientation === "landscape" ? base.w : base.h;
    return { w, h };
  };
  
  const pageSettings = resumeData?.pageSettings || resumeData?.content?.pageSettings;
  const pageSize = getPageSizePx(pageSettings);
 
  
  // Convert various units to px (supports number=px, 'px', 'mm', 'cm', 'in')
  const toPx = (v: any): number => {
    if (v == null) return 0;
    if (typeof v === 'number') return v;
    if (typeof v !== 'string') return 0;
    const s = v.trim().toLowerCase();
    const num = parseFloat(s);
    if (s.endsWith('px')) return num;
    if (s.endsWith('mm')) return num * (96 / 25.4);
    if (s.endsWith('cm')) return num * (96 / 2.54);
    if (s.endsWith('in')) return num * 96;
    // default assume px
    return isNaN(num) ? 0 : num;
  };
  
  const getMarginsPx = (ps: any | undefined) => {
    const m = ps?.margins || ps?.margin || {};
    // allow shorthand: number or string applies to all sides
    if (typeof m === 'number' || typeof m === 'string') {
      const all = toPx(m);
      return { top: all, right: all, bottom: all, left: all };
    }
    const top = toPx(m.top ?? m.y ?? m.vertical ?? ps?.marginTop);
    const right = toPx(m.right ?? m.x ?? m.horizontal ?? ps?.marginRight);
    const bottom = toPx(m.bottom ?? m.y ?? m.vertical ?? ps?.marginBottom);
    const left = toPx(m.left ?? m.x ?? m.horizontal ?? ps?.marginLeft);
    // sensible default if not provided
    const fallback = 36; // ~0.375in
    return {
      top: top || fallback,
      right: right || fallback,
      bottom: bottom || fallback,
      left: left || fallback,
    };
  };
  const margins = getMarginsPx(pageSettings);
 
  
  return (
    <TemplateCanvas style={{ width: pageSize.w, height: pageSize.h }}>
      <div
        style={{
          width: '100%',
          height: '100%',
          boxSizing: 'border-box',
          padding: `${margins.top}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
        }}
      >
        <Comp resumeData={resumeData} />
      </div>
    </TemplateCanvas>
  );
};
