import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Briefcase, Crown } from 'lucide-react';
import { listTemplates, registerTemplate, isRegistryInitialized, markRegistryInitialized, getTemplate } from './TemplateRegistry';
import { ModernProfessional } from './templates/ModernProfessional';
import { BlackWhiteClean } from './templates/BlackWhiteClean';
import { CanvaBWClean } from './templates/CanvaBWClean';

interface Template {
  id: number; // DB id (authoritative for persistence)
  slug: string; // registry key (e.g., 'modern-professional')
  name: string;
  description: string;
  preview: string;
  type: 'professional' | 'academic' | 'creative' | 'ats-optimized';
  isPremium: boolean;
}

interface TemplateSelectionProps {
  onTemplateSelect: (template: Template) => void;
  selectedTemplate?: Template;
  onProceed?: () => void;
  // New: use this to preselect a template from API-provided document.template_id
  initialTemplateId?: number | null;
}
// Helper to coerce a flexible registry type to our local union
const asTemplateType = (val: unknown): Template['type'] => {
  const allowed = ['professional', 'academic', 'creative', 'ats-optimized'] as const;
  if (typeof val === 'string' && (allowed as readonly string[]).includes(val)) {
    return val as Template['type'];
  }
  return 'professional';
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'professional': return <Briefcase className="h-4 w-4" />;
    case 'academic': return <FileText className="h-4 w-4" />;
    case 'creative': return <User className="h-4 w-4" />;
    case 'ats-optimized': return <FileText className="h-4 w-4" />;
    default: return <FileText className="h-4 w-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'professional': return 'bg-blue-100 text-blue-800';
    case 'academic': return 'bg-green-100 text-green-800';
    case 'creative': return 'bg-purple-100 text-purple-800';
    case 'ats-optimized': return 'bg-orange-100 text-orange-800';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const TemplateSelection: React.FC<TemplateSelectionProps> = ({
  onTemplateSelect,
  selectedTemplate,
  onProceed,
  initialTemplateId
}) => {
  console.log('[ResumeBuilder][Step 0] TemplateSelection: component mount; selectedTemplate=', selectedTemplate, 'initialTemplateId=', initialTemplateId);
  // Helper to slugify name -> id used by local registry
  const toSlug = (s: string) => s
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Ensure templates folder is registered so selection list is populated
  const initDefaultTemplates = () => {
    if (isRegistryInitialized()) return;
    console.log('[ResumeBuilder][Step 1] TemplateSelection.initDefaultTemplates: registering templates from ./templates glob');
    // 1) Auto-register every component found under ./templates via Vite import.meta.glob
    try {
      const modules = import.meta.glob('./templates/**/*.{tsx,ts,jsx,js}', { eager: true }) as Record<string, any>;
      Object.entries(modules).forEach(([path, mod]) => {
        const file = path.split('/').pop() || '';
        const base = file.replace(/\.(tsx|ts|jsx|js)$/i, '');
        const component = (mod as any)[base] || (mod as any).default;
        if (!component) return;
        const human = base.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').replace(/^\s+|\s+$/g, '');
        const slug = toSlug(base);
        const aliases = [base, base.toLowerCase(), slug.replace(/-/g, '_')];
        console.log('[ResumeBuilder] TemplateSelection: register from glob', { path, base, slug, aliases });
        registerTemplate({
          id: slug,
          slug,
          label: human || base,
          component,
          aliases,
        });
        console.log('[ResumeBuilder] TemplateSelection: registered', slug);
      });
    } catch (e) {
      console.log('[ResumeBuilder] TemplateSelection: glob failed, registering explicit defaults');
      // Fallback to explicit registrations if glob is not supported
      registerTemplate({
        id: 'modern-professional',
        slug: 'modern-professional',
        label: 'Modern Professional',
        component: ModernProfessional,
        aliases: ['1', 'modern_professional']
      });
      registerTemplate({
        id: 'black-white-clean',
        slug: 'black-white-clean',
        label: 'Black & White Clean',
        component: BlackWhiteClean,
        aliases: ['2', 'black_white_clean', 'bw-clean']
      });
    }
    markRegistryInitialized();
    console.log('[ResumeBuilder][Step 2] TemplateSelection: registry initialized');
  };
  initDefaultTemplates();

  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: find a registry entry that matches an API template by slug/key or id aliases
  const findRegistrySlugFor = (apiItem: any): string | null => {
    const registry = listTemplates();
    const apiSlug = String(apiItem.key || apiItem.slug || '').trim().toLowerCase();
    const apiIdStr = String(apiItem.id ?? '').trim();
    // 1) direct id match (rare): registry id equals api slug
    const bySlug = apiSlug ? registry.find(r => r.id === apiSlug) : undefined;
    if (bySlug) return String(bySlug.id);
    // 2) alias match: any registry alias equals api id or slug
    const byAlias = registry.find(r => (r.aliases || []).map(String).some(a => a === apiIdStr || a === apiSlug));
    if (byAlias) return String(byAlias.id);
    // 3) name-based fallback: slugify name and try id
    if (apiItem.name) {
      const nameSlug = toSlug(String(apiItem.name));
      const byName = registry.find(r => r.id === nameSlug || (r.aliases || []).includes(nameSlug));
      if (byName) return String(byName.id);
    }
    return null;
  };

  // Resolve a local component for a given slug; extend this mapping as new templates are added
  const resolveTemplateComponent = (slug: string) => {
    const map: Record<string, any> = {
      'modern-professional': ModernProfessional,
      // Route black/white clean slugs to the new Canva-styled implementation
      'black-white-clean': CanvaBWClean,
      'bw-clean': CanvaBWClean,
      'canva-bw-clean': CanvaBWClean,
      'canvabwclean': CanvaBWClean,
    };
    return map[slug] || ModernProfessional; // fallback to a safe default
  };

  // Fetch templates from API with fallback to local registry
  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setLoading(true);
        console.log('[ResumeBuilder][Step 3] TemplateSelection: fetching templates from API');
        const res = await fetch('/api/v1/templates?category=cv', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
        const json = await res.json();
        const apiData = Array.isArray(json?.data) ? json.data : [];
        console.log('[ResumeBuilder] TemplateSelection: API returned', apiData.length, 'items');
        // Register all API templates into the local registry so they are available by id/slug
        apiData.forEach((t: any) => {
          const slug = (findRegistrySlugFor(t) || String(t.key || t.slug || toSlug(String(t.name || 'template')))).toLowerCase();
          const name = String(t.name || 'Template');
          const description = String(t.description || 'Ready-to-use professional template');
          const preview = String(t.preview_url || '/assets/resume-previews/placeholder.png');
          const type = asTemplateType(t.category || t.type || 'professional');
          const isPremium = Boolean(t.is_premium || t.premium || false);
          const existing = getTemplate(slug);
          const component = existing?.component || resolveTemplateComponent(slug);
          console.log('[ResumeBuilder] TemplateSelection: register API template', { id: t.id, slug, name });
          registerTemplate({
            id: String(t.id),
            slug: slug,
            label: name,
            component,
            aliases: [String(t.id), String(t.key || ''), String(t.slug || ''), toSlug(name)].filter(Boolean) as string[],
            description,
            preview,
            type,
            isPremium,
            category: 'resume',
          });
        });
        // Now build the mapped list from the registry entries to ensure consistency
        const registered = listTemplates();
        console.log('[ResumeBuilder] TemplateSelection: registry now has', registered.length, 'unique entries');
        const mapped: Template[] = apiData.map((t: any) => {
          const slug = (findRegistrySlugFor(t) || String(t.key || t.slug || toSlug(String(t.name || 'template')))).toLowerCase();
          const reg = registered.find(r => r.slug === slug);
          return {
            id: Number(t.id),
            slug,
            name: reg?.label || String(t.name || 'Template'),
            description: reg?.description || String(t.description || 'Ready-to-use professional template'),
            preview: reg?.preview || String(t.preview_url || '/assets/resume-previews/placeholder.png'),
            type: asTemplateType(reg?.type || t.category || t.type || 'professional'),
            isPremium: Boolean(reg?.isPremium ?? (t.is_premium || t.premium || false)),
          } as Template;
        });
        if (isMounted) {
          if (mapped.length > 0) {
            setTemplates(mapped);
            console.log('[ResumeBuilder][Step 4] TemplateSelection: mapped templates ready', mapped.length);
            // Auto-select logic: resolve slug by template_id and select by slug
            const alreadySelectedId = selectedTemplate?.id || 0;
            if (!alreadySelectedId) {
              let chosen: Template | undefined;
              // 1) Try to resolve slug from the bulk list
              let resolvedSlug: string | null = null;
              if (initialTemplateId) {
                const apiItem = apiData.find((x: any) => Number(x.id) === Number(initialTemplateId));
                if (apiItem) {
                  resolvedSlug = (findRegistrySlugFor(apiItem) || String(apiItem.key || apiItem.slug || toSlug(String(apiItem.name || 'template')))).toLowerCase();
                } else {
                  // 2) Not in list? Fetch single template to resolve slug
                  try {
                    const single = await fetch(`/api/v1/templates/${initialTemplateId}`, { headers: { 'Accept': 'application/json' } });
                    if (single.ok) {
                      const sj = await single.json();
                      const t = sj?.data || sj; // support plain or data-wrapped
                      if (t) {
                        resolvedSlug = (findRegistrySlugFor(t) || String(t.key || t.slug || toSlug(String(t.name || 'template')))).toLowerCase();
                      }
                    }
                  } catch {}
                }
              }
              if (resolvedSlug) {
                chosen = mapped.find(m => m.slug === resolvedSlug);
              }
              if (!chosen) {
                // Prefer a well-known default by slug, else first item
                chosen = mapped.find(m => m.slug === 'modern-professional') || mapped[0];
              }
              if (chosen) {
                console.log('[ResumeBuilder][Step 5] TemplateSelection: auto-selecting template', chosen.slug, 'for initialTemplateId', initialTemplateId);
                onTemplateSelect(chosen);
              }
            }
          } else {
            console.log('[ResumeBuilder] TemplateSelection: API returned empty, using fallback registry list');
            const fallback = listTemplates().map((t) => ({
              id: Number.isFinite(Number(t.id)) ? Number(t.id) : 0,
              slug: String(t.id),
              name: String(t.label || t.id),
              description: t.description || 'Ready-to-use professional template',
              preview: t.preview || '/assets/resume-previews/placeholder.png',
              type: asTemplateType(t.type),
              isPremium: !!t.isPremium,
            }));
            setTemplates(fallback);
            // Apply same auto-select on fallback
            const alreadySelectedId = selectedTemplate?.id || 0;
            if (!alreadySelectedId) {
              let chosen: Template | undefined;
              // Try to resolve slug by id even on fallback registry-only list
              if (initialTemplateId) {
                // Attempt to fetch single template to discover slug
                try {
                  const single = await fetch(`/api/v1/templates/${initialTemplateId}`, { headers: { 'Accept': 'application/json' } });
                  if (single.ok) {
                    const sj = await single.json();
                    const t = sj?.data || sj;
                    if (t) {
                      const resolvedSlug = (findRegistrySlugFor(t) || String(t.key || t.slug || toSlug(String(t.name || 'template')))).toLowerCase();
                      chosen = fallback.find(m => m.slug === resolvedSlug);
                    }
                  }
                } catch {}
              }
              if (!chosen) {
                chosen = fallback.find(m => m.slug === 'modern-professional') || fallback[0];
              }
              if (chosen) {
                console.log('[ResumeBuilder][Step 5] TemplateSelection: auto-selecting fallback template', chosen.slug);
                onTemplateSelect(chosen as Template);
              }
            }
          }
        }
      } catch (e: any) {
        if (isMounted) {
          setError(e?.message || 'Failed to load templates');
          console.log('[ResumeBuilder] TemplateSelection: error while fetching templates ->', e?.message);
          const fallback = listTemplates().map((t) => ({
            id: Number.isFinite(Number(t.id)) ? Number(t.id) : 0,
            slug: String(t.id),
            name: String(t.label || t.id),
            description: t.description || 'Ready-to-use professional template',
            preview: t.preview || '/assets/resume-previews/placeholder.png',
            type: asTemplateType(t.type),
            isPremium: !!t.isPremium,
          }));
          setTemplates(fallback);
          // Auto-select on error fallback as well
          const alreadySelectedId = selectedTemplate?.id || 0;
          if (!alreadySelectedId) {
            let chosen: Template | undefined;
            if (initialTemplateId) {
              chosen = fallback.find(m => m.id === Number(initialTemplateId));
            }
            if (!chosen) {
              chosen = fallback.find(m => m.slug === 'modern-professional') || fallback[0];
            }
            if (chosen) {
              console.log('[ResumeBuilder][Step 5] TemplateSelection: auto-selecting template after error', chosen.slug);
              onTemplateSelect(chosen as Template);
            }
          }
        }
      } finally {
        if (isMounted) setLoading(false);
        console.log('[ResumeBuilder] TemplateSelection: loading finished');
      }
    };
    load();
    return () => { isMounted = false; };
  }, [initialTemplateId]);
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Resume Template</h2>
        <p className="text-muted-foreground">
          Select a template that best fits your industry and career level
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-md p-4 animate-pulse">
              <div className="h-5 w-40 bg-muted rounded mb-3" />
              <div className="h-[260px] bg-muted rounded mb-4" />
              <div className="flex items-center justify-between">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="h-8 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && error && (
        <div className="text-center text-amber-600 text-sm">{error} — showing defaults.</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(templates || []).map((template) => (
          <Card
            key={template.slug}
            className={`group relative cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate?.slug === template.slug
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getTypeIcon(template.type)}
                  {template.name}
                </CardTitle>
                {template.isPremium && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="aspect-[3/4] bg-muted rounded-md relative overflow-hidden">
                {template.preview ? (
                  <img
                    src={template.preview}
                    alt={`${template.name} preview`}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <FileText className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm">Template Preview</p>
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                  <Button
                    className="shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTemplateSelect(template);
                      onProceed && onProceed();
                    }}
                  >
                    Customize template
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Badge className={getTypeColor(template.type)}>
                  {template.type.replace('-', ' ')}
                </Badge>
                <Button
                  size="sm"
                  variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                >
                  {selectedTemplate?.slug === template.slug ? 'Selected' : 'Select'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};