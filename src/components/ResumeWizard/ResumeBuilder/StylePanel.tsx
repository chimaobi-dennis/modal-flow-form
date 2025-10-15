import React, { useEffect, useMemo, useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  ChevronDown,
  ChevronUp,
  Check,
  FileText
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Slider } from '../../ui/slider';
import { Input } from '../../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

interface StylePanelProps {
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  // Optional: provide to receive numeric backend template id
  onTemplateSelect?: (templateId: number) => void;
  // Optional: saving state identifier (passed by parent; not used here but kept for API symmetry)
  templateSavingId?: number | null;
  theme: any;
  onThemeChange: (theme: any) => void;
  typography: any;
  onTypographyChange: (typography: any) => void;
  // Page settings (document overrides of template defaults)
  pageSettings: any;
  onPageSettingsChange: (settings: any) => void;
  // If provided, only this section will be shown (for collapsed popup)
  focusSection?: 'templates' | 'typography' | 'theme' | 'page';
}

type TemplateItem = {
  id: number; // backend id
  name: string;
  preview_url?: string;
  // derived key used by renderer registry
  key: string;
};

export const StylePanel: React.FC<StylePanelProps> = ({
  selectedTemplate,
  onTemplateChange,
  onTemplateSelect,
  theme,
  onThemeChange,
  typography,
  onTypographyChange,
  pageSettings,
  onPageSettingsChange,
  focusSection
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([focusSection || 'templates'])
  );

  // Templates state and loading
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[ResumeBuilder] StylePanel mounted', { selectedTemplate });
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const res = await fetch('/api/v1/templates?category=cv&order_by=popularity', {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`Failed to load templates (${res.status})`);
        const data = await res.json();
        const list = (Array.isArray(data) ? data : data?.data || []) as any[];
        // Normalize to registry-friendly key (slug). Prefer schema.meta.slug, then explicit slug/key/name
        const slugify = (s: any) =>
          String(s || '')
            .trim()
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const mapped: TemplateItem[] = list.map((t) => {
          const metaSlug = t.schema?.meta?.slug || t.schema?.slug || t.meta?.slug;
          const candidate = metaSlug || t.slug || t.key || t.schema?.key || t.name || t.title;
          const key = slugify(candidate || 'modern-professional');
          return {
            id: Number(t.id),
            name: t.name || t.title || 'Template',
            preview_url: t.preview_url || t.preview || t.thumbnail_url || undefined,
            key,
          } as TemplateItem;
        });
        if (active) setTemplates(mapped);
      } catch (e: any) {
        if (active) setTemplatesError(e?.message || 'Failed to load templates');
      } finally {
        if (active) setTemplatesLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const colorPresets = [
    { name: 'Professional', primary: '#2563eb', secondary: '#64748b', accent: '#0ea5e9' },
    { name: 'Creative', primary: '#dc2626', secondary: '#f97316', accent: '#fbbf24' },
    { name: 'Minimal', primary: '#000000', secondary: '#6b7280', accent: '#9ca3af' },
    { name: 'Nature', primary: '#16a34a', secondary: '#84cc16', accent: '#22d3ee' },
    { name: 'Elegant', primary: '#7c3aed', secondary: '#a855f7', accent: '#ec4899' },
    { name: 'Ocean', primary: '#0891b2', secondary: '#06b6d4', accent: '#22d3ee' },
  ];

  const fonts = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Playfair Display',
    'Merriweather',
    'Source Sans Pro',
    'Raleway',
    'Ubuntu',
    'Nunito',
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const updateThemeColor = (colorType: string, color: string) => {
    onThemeChange({
      ...theme,
      [colorType]: color
    });
  };

  const updateTypography = (property: string, value: any) => {
    onTypographyChange({
      ...typography,
      [property]: value
    });
  };

  const updatePageSettings = (property: string, value: any) => {
    onPageSettingsChange({
      ...pageSettings,
      [property]: value
    });
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-2">
        {/* Templates Section */}
        {(!focusSection || focusSection === 'templates') && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <button
              onClick={() => toggleSection('templates')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4" />
                <span className="font-medium text-sm">Templates</span>
              </div>
              {expandedSections.has('templates') ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.has('templates') && (
              <div className="p-4 border-t">
                {templatesLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="rounded-lg overflow-hidden border-2 border-gray-200">
                        <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                        <div className="p-2">
                          <div className="h-3 w-24 bg-gray-200 animate-pulse rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : templatesError ? (
                  <div className="text-xs text-red-600">{templatesError}</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          // Notify parent with slug/key for live preview and numeric id for persistence
                          onTemplateChange(template.key);
                          onTemplateSelect?.(template.id);
                        }}
                        className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                          // Consider multiple identity forms from parent state (slug, key, numeric id as string)
                          [template.key, String(template.id)].includes(String(selectedTemplate).toLowerCase())
                            ? 'border-blue-500 shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="aspect-[3/4] bg-gray-100">
                          {template.preview_url ? (
                            <img
                              src={template.preview_url}
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                              {template.name}
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{template.name}</span>
                        </div>
                        {[
                          template.key,
                          String(template.id),
                        ].includes(String(selectedTemplate).toLowerCase()) && (
                          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Typography Section */}
        {(!focusSection || focusSection === 'typography') && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <button
              onClick={() => toggleSection('typography')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <span className="font-medium text-sm">Typography</span>
              </div>
              {expandedSections.has('typography') ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.has('typography') && (
              <div className="p-4 border-t space-y-4">
                <div>
                  <Label className="text-xs mb-2">Font Family</Label>
                  <Select
                    value={typography?.fontFamily || 'Inter'}
                    onValueChange={(value) => updateTypography('fontFamily', value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font} value={font}>
                          <span style={{ fontFamily: font }}>{font}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-2">Font Size</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[typography?.fontSize || 14]}
                      onValueChange={([value]) => updateTypography('fontSize', value)}
                      min={10}
                      max={20}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{typography?.fontSize || 14}px</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2">Line Height</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[typography?.lineHeight || 1.5]}
                      onValueChange={([value]) => updateTypography('lineHeight', value)}
                      min={1}
                      max={2.5}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{typography?.lineHeight || 1.5}</span>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2">Letter Spacing</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[typography?.letterSpacing || 0]}
                      onValueChange={([value]) => updateTypography('letterSpacing', value)}
                      min={-2}
                      max={5}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{typography?.letterSpacing || 0}px</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Colors Section */}
        {(!focusSection || focusSection === 'theme') && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <button
              onClick={() => toggleSection('theme')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <span className="font-medium text-sm">Theme Colors</span>
              </div>
              {expandedSections.has('theme') ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.has('theme') && (
              <div className="p-4 border-t space-y-4">
                <div>
                  <Label className="text-xs mb-2">Color Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => onThemeChange({
                          primary: preset.primary,
                          secondary: preset.secondary,
                          accent: preset.accent
                        })}
                        className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex gap-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        <span className="text-xs">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs mb-1">Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={theme?.primary || '#2563eb'}
                        onChange={(e) => updateThemeColor('primary', e.target.value)}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={theme?.primary || '#2563eb'}
                        onChange={(e) => updateThemeColor('primary', e.target.value)}
                        className="flex-1 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-1">Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={theme?.secondary || '#64748b'}
                        onChange={(e) => updateThemeColor('secondary', e.target.value)}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={theme?.secondary || '#64748b'}
                        onChange={(e) => updateThemeColor('secondary', e.target.value)}
                        className="flex-1 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs mb-1">Accent Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={theme?.accent || '#0ea5e9'}
                        onChange={(e) => updateThemeColor('accent', e.target.value)}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        type="text"
                        value={theme?.accent || '#0ea5e9'}
                        onChange={(e) => updateThemeColor('accent', e.target.value)}
                        className="flex-1 h-9 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Page Section */}
        {(!focusSection || focusSection === 'page') && (
          <div className="bg-white rounded-lg border overflow-hidden">
            <button
              onClick={() => toggleSection('page')}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="font-medium text-sm">Page</span>
              </div>
              {expandedSections.has('page') ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
            {expandedSections.has('page') && (
              <div className="p-4 border-t space-y-4">
                <div>
                  <Label className="text-xs mb-2">Page Format</Label>
                  <Select
                    value={pageSettings?.format || 'A4'}
                    onValueChange={(value) => updatePageSettings('format', value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A4">A4</SelectItem>
                      <SelectItem value="Letter">Letter</SelectItem>
                      <SelectItem value="Legal">Legal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-2">Margins (mm)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs text-gray-500">Top</Label>
                      <Input
                        type="number"
                        value={pageSettings?.margins?.top ?? 10}
                        onChange={(e) => updatePageSettings('margins', {
                          ...pageSettings?.margins,
                          top: parseInt(e.target.value)
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Bottom</Label>
                      <Input
                        type="number"
                        value={pageSettings?.margins?.bottom ?? 10}
                        onChange={(e) => updatePageSettings('margins', {
                          ...pageSettings?.margins,
                          bottom: parseInt(e.target.value)
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Left</Label>
                      <Input
                        type="number"
                        value={pageSettings?.margins?.left ?? 10}
                        onChange={(e) => updatePageSettings('margins', {
                          ...pageSettings?.margins,
                          left: parseInt(e.target.value)
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">Right</Label>
                      <Input
                        type="number"
                        value={pageSettings?.margins?.right ?? 10}
                        onChange={(e) => updatePageSettings('margins', {
                          ...pageSettings?.margins,
                          right: parseInt(e.target.value)
                        })}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-xs mb-2">Columns</Label>
                  <Select
                    value={pageSettings?.columns || '1'}
                    onValueChange={(value) => updatePageSettings('columns', value)}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Column</SelectItem>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs mb-2">Line Spacing</Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[pageSettings?.lineSpacing ?? 1.5]}
                      onValueChange={([value]) => updatePageSettings('lineSpacing', value)}
                      min={1}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="text-sm w-12 text-right">{pageSettings?.lineSpacing ?? 1.5}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
