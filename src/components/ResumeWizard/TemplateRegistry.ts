import React from 'react';

export type TemplateProps = { resumeData: any };
export type TemplateComponent = React.FC<TemplateProps>;

export interface TemplateEntry {
  id: string | number;   // numeric or string id
  slug: string | string[]; // canonical slug or list (first is canonical)
  label: string;        // human label
  component: TemplateComponent;
  aliases?: string[];   // optional aliases, e.g. ["1", "modern_professional", "modern-professional"]
  // Optional metadata for admin/UI
  description?: string;
  preview?: string;     // preview image URL
  type?: 'professional' | 'academic' | 'creative' | 'ats-optimized' | string;
  isPremium?: boolean;
  category?: string;    // e.g. resume, cover-letter, sop
}
 

const registry = new Map<string, TemplateEntry>();
let initialized = false;

export function registerTemplate(entry: TemplateEntry) {
  const slugs = Array.isArray(entry.slug) ? entry.slug : [entry.slug];
  const canonical = slugs[0];
  // index by canonical slug
  if (canonical) registry.set(String(canonical), entry);
  // index by all provided slugs
  slugs.slice(1).forEach(s => s && registry.set(String(s), entry));
  // index by id
  if (entry.id !== undefined && entry.id !== null) registry.set(String(entry.id), entry);
  // index by aliases
  (entry.aliases || []).forEach(a => a && registry.set(String(a), entry));
}

export function getTemplate(key?: string | number | null): TemplateEntry | undefined {
  if (key === undefined || key === null) return undefined;
  const k = String(key);
  const hit = registry.get(k);
  
  return hit;
}

export function listTemplates(): TemplateEntry[] {
  // return unique entries by canonical id
  const uniques = new Map<string, TemplateEntry>();
  registry.forEach((v) => {
    const slugKey = Array.isArray(v.slug) ? String(v.slug[0]) : String(v.slug);
    uniques.set(slugKey, v);
  });
  const arr = Array.from(uniques.values());
  
  return arr;
}

export function isRegistryInitialized() {
  
  return initialized;
}

export function markRegistryInitialized() {
  
  initialized = true;
}
