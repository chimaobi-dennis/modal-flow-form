import React, { useState, useEffect, useRef } from 'react';
import { ResumeForm } from './ResumeForm';
import { PreviewToolbar } from './PreviewToolbar';
import { StylePanel } from './StylePanel';
// Render resume templates on an A4 canvas
import { TemplateRenderer } from '../TemplateRenderer';
import { getTemplate as getRegistryTemplate, listTemplates, registerTemplate, isRegistryInitialized, markRegistryInitialized } from '../TemplateRegistry';
import { Button } from '../../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { TemplateSelection } from '../TemplateSelection';
import {
  ArrowLeft,
  Save,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Star,
  Globe,
  Award,
  Shield,
  Heart,
  Folder as FolderIcon,
  BookOpen,
  Users,
  Hash,
  Layout,
  Type,
  Palette
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DocumentApi from '@/lib/documentApi';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ResumeBuilderProps {
  initialData?: any;
  onSave?: (data: any) => void;
  documentId?: number;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  initialData,
  onSave,
  documentId
}) => {
  
  // Initialize template registry at mount so preview can resolve templates before Style panel opens
  useEffect(() => {
    if (isRegistryInitialized()) return;
    try {
      const toSlug = (s: string) => s.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const modules = import.meta.glob('../templates/**/*.{tsx,ts,jsx,js}', { eager: true }) as Record<string, any>;
      Object.entries(modules).forEach(([path, mod]) => {
        const file = path.split('/').pop() || '';
        const base = file.replace(/\.(tsx|ts|jsx|js)$/i, '');
        const component = (mod as any)[base] || (mod as any).default;
        if (!component) return;
        const human = base.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').replace(/^\s+|\s+$/g, '');
        const slug = toSlug(base);
        const aliases = [base, base.toLowerCase(), slug.replace(/-/g, '_')];
        registerTemplate({ id: slug, slug, label: human || base, component, aliases });
      });
      // Also extend aliases for backend templates so numeric id/key/slug map to local entries
      (async () => {
        try {
          const list = await DocumentApi.getTemplatesByCategory('cv');
          list.forEach((t: any) => {
            const name = String(t.name || 'Template');
            const key = String(t.key || t.slug || '').trim().toLowerCase();
            const idStr = String(t.id || '').trim().toLowerCase();
            const nameSlug = toSlug(name);
            const preferredId = (key || nameSlug).toLowerCase();
            const existing = getRegistryTemplate(preferredId);
            const aliases = [idStr, key, String(t.slug || '').toLowerCase(), nameSlug].filter(Boolean);
            if (existing) {
              registerTemplate({
                id: existing.id,
                slug: String(existing.id),
                label: existing.label,
                component: existing.component,
                aliases: Array.from(new Set([...(existing.aliases || []), ...aliases]))
              });
            }
          });
        } catch {}
      })();
    } catch {
      // no-op; TemplateRenderer will register safe defaults
    } finally {
      markRegistryInitialized();
    }
  }, []);
  // Mount log for initial UI preferences and defaults
  useEffect(() => {
    
  }, []);
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSpacePressedRef = useRef(false);
  const firstLoadRef = useRef(true);
  const [resumeData, setResumeData] = useState(initialData || {
    basics: {
      fullName: '',
      headline: '',
      email: '',
      phone: '',
      website: '',
      location: '',
      picture: ''
    },
    summary: '',
    profile: {},
    experience: [],
    education: [],
    skills: [],
    languages: [],
    awards: [],
    certifications: [],
    interests: [],
    projects: [],
    publications: [],
    volunteering: [],
    custom: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('onyx');
  const [theme, setTheme] = useState({
    primary: initialData?.theme?.primary || '#2563eb',
    secondary: initialData?.theme?.secondary || '#64748b',
    accent: initialData?.theme?.accent || '#0ea5e9'
  });
  const [typography, setTypography] = useState({
    fontFamily: initialData?.typography?.fontFamily || 'Inter',
    fontSize: initialData?.typography?.fontSize || 14,
    lineHeight: initialData?.typography?.lineHeight || 1.5,
    letterSpacing: initialData?.typography?.letterSpacing || 0
  });
  // User-adjustable page settings (overrides template defaults)
  const [pageSettings, setPageSettings] = useState({
    format: initialData?.pageSettings?.format || 'A4',
    margins: { top: initialData?.pageSettings?.margins?.top || 10, bottom: initialData?.pageSettings?.margins?.bottom || 10, left: initialData?.pageSettings?.margins?.left || 10, right: initialData?.pageSettings?.margins?.right || 10 },
    columns: initialData?.pageSettings?.columns || '1',
    lineSpacing: initialData?.pageSettings?.lineSpacing || 1.5
  });
  // Load selected web font so it renders in preview and exports
  const googleFontHrefFor = (family: string): string | null => {
    const map: Record<string, string> = {
      'Inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
      'Roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
      'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap',
      'Lato': 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap',
      'Montserrat': 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap',
      'Poppins': 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
      'Playfair Display': 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap',
      'Merriweather': 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap',
      'Source Sans Pro': 'https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap',
      'Raleway': 'https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;600;700&display=swap',
      'Ubuntu': 'https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap',
      'Nunito': 'https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700&display=swap'
    };
    return map[family] || null;
  };

  const ensureFontLoaded = async (family: string) => {
    const href = googleFontHrefFor(family);
    if (href && !document.querySelector(`link[data-resume-font='${family}']`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-resume-font', family);
      document.head.appendChild(link);
    }
    try {
      // Give the browser a tick to fetch CSS, then request the font
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      // Load regular weight to trigger fetch; fall back silently if not supported
      if ((document as any).fonts?.load) {
        await (document as any).fonts.load(`16px ${family}`);
      }
    } catch {}
  };

  useEffect(() => {
    if (typography?.fontFamily) {
      ensureFontLoaded(typography.fontFamily);
    }
  }, [typography?.fontFamily]);
  // Page settings are now driven entirely by API/template; local pageSettings removed from preview logic

  const [zoom, setZoom] = useState(100);
  const [zoomMode, setZoomMode] = useState<'fit' | 'manual'>('fit');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([resumeData]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [savedDocumentId, setSavedDocumentId] = useState<number | null>(documentId ?? null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [templateSavingId, setTemplateSavingId] = useState<number | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(initialData === undefined);
  // For live-updating relative time display
  const [nowTs, setNowTs] = useState<number>(Date.now());

  // Fit-to-screen based on actual rendered page from API-driven template
  const applyFitZoom = () => {
    const viewport = previewScrollRef.current;
    if (!viewport) return;
    const padX = 32; // inner frame padding safety
    const padY = 32;
    const safety = 2;
    const availableW = Math.max(0, viewport.clientWidth - padX - safety);
    const availableH = Math.max(0, viewport.clientHeight - padY - safety);
    const pageEl = previewRef.current?.firstElementChild as HTMLElement | null;
    const realW = pageEl?.clientWidth || 794; // fallback to A4 width
    const realH = pageEl?.clientHeight || 1123; // fallback to A4 height
    const scaleW = (availableW / realW) * 100;
    const scaleH = (availableH / realH) * 100;
    const fit = Math.min(100, Math.max(50, Math.min(scaleW, scaleH)));
    setZoom(Math.round(fit));
  };
  useEffect(() => {
    if (zoomMode === 'fit') {
      // wait a tick for DOM to apply new layout before measuring
      requestAnimationFrame(() => applyFitZoom());
    }
  }, [zoomMode, selectedTemplate, typography, pageSettings]);

  // Resizable sidebars
  const [leftWidth, setLeftWidth] = useState<number>(40);
  const [rightWidth, setRightWidth] = useState<number>(40);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const startXRef = useRef(0);
  const startLeftWidthRef = useRef(380);
  const startRightWidthRef = useRef(320);
  const [activeLeftPopup, setActiveLeftPopup] = useState<string | null>(null);
  const [activeRightPopup, setActiveRightPopup] = useState<
    'templates' | 'typography' | 'theme' | 'page' | null
  >(null);

  // Add to history when data changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (JSON.stringify(resumeData) !== JSON.stringify(history[historyIndex])) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(resumeData);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [resumeData]);

  // Load persisted zoom settings on mount
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('resume_preview_zoom_mode');
      const savedZoom = localStorage.getItem('resume_preview_zoom_level');
      if (savedMode === 'manual' || savedMode === 'fit') setZoomMode(savedMode as 'fit' | 'manual');
      if (savedZoom) {
        const z = Number(savedZoom);
        if (!Number.isNaN(z) && z >= 50 && z <= 200) setZoom(z);
      }
    } catch {}
  }, []);

  // Persist zoom settings
  useEffect(() => {
    try {
      localStorage.setItem('resume_preview_zoom_mode', zoomMode);
      localStorage.setItem('resume_preview_zoom_level', String(zoom));
    } catch {}
  }, [zoomMode, zoom]);

  // Recompute fit on mount and resizing when in 'fit' mode
  useEffect(() => {
    if (zoomMode !== 'fit') return;
    applyFitZoom();
    const viewport = previewScrollRef.current;
    if (!viewport) return;
    const ro = new ResizeObserver(() => {
      if (zoomMode === 'fit') applyFitZoom();
    });
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [zoomMode]);

  // Helper to read user_id from DOM attributes (fallback if unauth)
  const getUserIdFromDom = (): number | undefined => {
    const el = document.querySelector('[data-user-id]') as HTMLElement | null;
    const val = el?.getAttribute('data-user-id') || document.body.getAttribute('data-user-id');
    const num = val ? parseInt(val, 10) : NaN;
    return Number.isFinite(num) ? num : undefined;
  };

  // Template dialog selection handler (DB-driven)
  const handleTemplateDialogSelect = async (template: any) => {
    try {
      // Persist to backend immediately
      if (template?.id) await handleTemplateSelectImmediate(Number(template.id));
      // Update FE registry key for renderer
      if (template?.slug || template?.key) setSelectedTemplate(template.slug || template.key);
      setTemplateModalOpen(false);
    } catch (e) {
      
      setTemplateModalOpen(false);
    }
  };

  // Immediate persist when a template is selected from the right sidebar
  const handleTemplateSelectImmediate = async (templateId: number) => {
    try {
      setSelectedTemplateId(templateId);
      setTemplateSavingId(templateId);
      const userId = getUserIdFromDom();
      if (savedDocumentId) {
        // Update existing document with new template_id immediately
        const body: any = {
          status: 'draft',
          ...(userId ? { user_id: userId } : {})
        };
        (body as any).template_id = templateId;
        await DocumentApi.updateDocument(savedDocumentId, body);
      } else {
        // No saved document yet; keep state only. Creation flow/autosave will include template_id.
      }
    } catch (e) {
      
    } finally {
      setTemplateSavingId(null);
    }
  };

  // Compose backend payload content structure matching API
  const buildContentPayload = () => {
    // normalize experience present/current for backend
    const normalized = { ...resumeData } as any;
    if (Array.isArray(normalized.experience)) {
      normalized.experience = normalized.experience.map((exp: any) => {
        const current = !!exp?.current;
        return {
          ...exp,
          current,
          present: current,
          endDate: current ? 'Present' : (exp?.endDate ?? ''),
        };
      });
    }
    return {
      theme,
      typography,
      content: normalized
    };
  };

  // Default save handler to backend when onSave prop is not provided
  const defaultSave = async () => {
    const userId = getUserIdFromDom();
    const title = resumeData?.basics?.fullName
      ? `${resumeData.basics.fullName} - CV`
      : 'Untitled CV';
    const payload = {
      title,
      category: 'cv',
      type: 'document' as const,
      template_id: (selectedTemplateId ?? undefined) as number | undefined, // backend will auto-pick by usage_count if undefined
      content: buildContentPayload(),
      metadata: undefined as any,
      language: 'en',
      application_id: null as number | null,
      program_id: null as number | null,
      ...(userId ? { user_id: userId } : {})
    };

    if (savedDocumentId) {
      const updateBody: any = {
        title,
        content: payload.content,
        status: 'draft',
        ...(userId ? { user_id: userId } : {})
      };
      if (selectedTemplateId) updateBody.template_id = selectedTemplateId;
      const updated = await DocumentApi.updateDocument(savedDocumentId, updateBody);
      return updated;
    } else {
      const created = await DocumentApi.saveDocument(payload as any);
      if ((created as any)?.id) setSavedDocumentId((created as any).id as number);
      return created;
    }
  };

  // Autosave on changes (debounced)
  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      return;
    }
    const t = setTimeout(async () => {
      setIsSaving(true);
      try {
        if (onSave) {
          await onSave({
            ...resumeData,
            template: selectedTemplate,
            theme,
            typography,
            pageSettings
          });
        } else {
          await defaultSave();
        }
        setLastSavedAt(new Date());
      } catch (e) {
        
      } finally {
        setIsSaving(false);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [resumeData, selectedTemplate, selectedTemplateId, theme, typography, pageSettings, onSave]);

  // Track initial loading based on initialData availability
  useEffect(() => {
    if (initialData !== undefined) {
      setIsInitialLoading(false);
      // When initial data arrives async, hydrate editor state and history
      try {
        if (initialData && typeof initialData === 'object') {
          setResumeData(initialData);
          setHistory([initialData]);
          setHistoryIndex(0);
        }
      } catch (e) {
        
      }
    }
  }, [initialData]);

  // Immediate preselect from initialData.template and template_id if present
  useEffect(() => {
    if (!initialData || selectedTemplateId) return;
    try {
      const tplObj = (initialData as any)?.template;
      const tplId = (initialData as any)?.template_id ?? tplObj?.id;
      const slug = String(tplObj?.slug || '').trim().toLowerCase();
      if (tplId && !selectedTemplateId) setSelectedTemplateId(Number(tplId));
      if (slug && selectedTemplate === 'onyx') {
        // only override default once
        setSelectedTemplate(slug);
      }
    } catch {}
  }, [initialData, selectedTemplateId]);

  // Initialize selected template from document.template_id (numeric) -> resolve slug and set both states
  useEffect(() => {
    const tplId = (initialData as any)?.template_id as number | undefined;
    if (!tplId || selectedTemplateId) return;
    let active = true;
    const resolve = async () => {
      try {
        
        // Fetch single template by id via API helper to discover slug/key
        const t = await DocumentApi.getTemplate(tplId);
        if (t) {
          const pickSlug = (val: string) => val
            .toLowerCase()
            .replace(/&/g, ' and ')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          let raw = String((t as any)?.slug || (t as any)?.key || (t as any)?.schema?.meta?.slug || (t as any)?.schema?.slug || '').trim();
          let slug = raw ? pickSlug(raw) : '';
          if (!slug) {
            // Fallback: consult list endpoint to discover key/slug for this id
            try {
              const res = await fetch('/api/v1/templates?category=cv', { headers: { 'Accept': 'application/json' } });
              if (res.ok) {
                const js = await res.json();
                const arr = Array.isArray(js?.data) ? js.data : [];
                const item = arr.find((x: any) => Number(x?.id) === Number(tplId));
                if (item) {
                  const raw2 = String(item.key || item.slug || item.name || '').trim();
                  slug = raw2 ? pickSlug(raw2) : slug;
                }
              }
            } catch {}
          }
          
          // Map backend slug/id to local registry key if possible
          let finalKey = slug;
          try {
            const bySlug = slug ? getRegistryTemplate(slug) : undefined;
            const byId = getRegistryTemplate(tplId);
            let entry = bySlug || byId;
            if (!entry && slug) {
              // Try find by normalized candidates
              const candidates = [slug];
              const templates = listTemplates();
              entry = templates.find(e => e.id === slug || (e.aliases || []).includes(slug));
            }
            if (entry) finalKey = entry.id;
          } catch {}
          
          if (active) {
            setSelectedTemplateId(tplId);
            if (finalKey) setSelectedTemplate(finalKey);
            // Ensure TemplateRenderer sees it via resumeData.template
            setResumeData(prev => ({
              ...prev,
              template: {
                id: tplId,
                slug: finalKey || slug || undefined,
                name: (finalKey || slug || '').replace(/-/g, ' ')
              }
            }));
          }
        }
      } catch {
        if (active) setSelectedTemplateId(tplId);
      }
    };
    resolve();
    return () => { active = false; };
  }, [initialData, selectedTemplateId]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setResumeData(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setResumeData(history[historyIndex + 1]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave({
          ...resumeData,
          template: selectedTemplate,
          theme,
          typography,
          pageSettings
        });
      } else {
        await defaultSave();
      }
      setLastSavedAt(new Date());
    } catch (error) {
      
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!previewRef.current) return;

    try {
      // Ensure selected font is loaded before rasterizing
      if (typography?.fontFamily) await ensureFontLoaded(typography.fontFamily);
      await new Promise((r) => requestAnimationFrame(() => r(null)));

      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      // Determine page size from actual rendered template size
      const pageEl = previewRef.current.firstElementChild as HTMLElement | null;
      const pxW = pageEl?.clientWidth || canvas.width;
      const pxH = pageEl?.clientHeight || canvas.height;
      const mmW = (pxW * 25.4) / 96;
      const mmH = (pxH * 25.4) / 96;
      const orientation = mmW > mmH ? 'landscape' : 'portrait';
      const pdf = new jsPDF({ orientation, unit: 'mm', format: [mmW, mmH] });

      const imgWidth = mmW;
      const imgHeight = mmH;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`resume-${Date.now()}.pdf`);
    } catch (error) {
      
    }
  };

  const handlePrint = async () => {
    if (!previewRef.current) return;
    try {
      if (typography?.fontFamily) await ensureFontLoaded(typography.fontFamily);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      // Create a hidden iframe to print in the same window
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) return;
      // Compute page mm size to match the rendered template
      const pageEl = previewRef.current.firstElementChild as HTMLElement | null;
      const pxW = pageEl?.clientWidth || canvas.width;
      const pxH = pageEl?.clientHeight || canvas.height;
      const mmW = (pxW * 25.4) / 96;
      const mmH = (pxH * 25.4) / 96;
      doc.open();
      doc.write(`<!doctype html><html><head><title>Print Resume</title>
        <style>
          @page { size: ${mmW}mm ${mmH}mm; margin: 0; }
          html, body { height: 100%; margin: 0; }
          body { display: flex; align-items: center; justify-content: center; }
          img { width: ${mmW}mm; height: ${mmH}mm; }
        </style>
      </head><body>
        <img id="print-img" src="${imgData}" />
        <script>
          const img = document.getElementById('print-img');
          img.onload = function() { window.focus(); window.print(); };
          window.onafterprint = function() { setTimeout(() => parent.document.body.removeChild(frameElement), 0); };
        <\/script>
      </body></html>`);
      doc.close();
    } catch (e) {
      
    }
  };

  const handleDuplicate = () => {
    const newData = JSON.parse(JSON.stringify(resumeData));
    setResumeData(newData);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all data?')) {
      setResumeData({
        basics: {
          fullName: '',
          headline: '',
          email: '',
          phone: '',
          website: '',
          location: '',
          picture: ''
        },
        summary: '',
        profile: {},
        experience: [],
        education: [],
        skills: [],
        languages: [],
        awards: [],
        certifications: [],
        interests: [],
        projects: [],
        publications: [],
        volunteering: [],
        custom: []
      });
    }
  };

  const handleFullscreen = () => {
    if (previewRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        previewRef.current.requestFullscreen();
      }
    }
  };

  // Sidebar resize handlers (Pointer Events for better grab + touch support)
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (isResizingLeft) {
        const dx = e.clientX - startXRef.current;
        const screenWidth = window.innerWidth;
        const maxLeftWidth = Math.floor(screenWidth * 0.7); // allow up to 70% of screen
        const next = Math.max(40, Math.min(maxLeftWidth, startLeftWidthRef.current + dx));
        setLeftWidth(next);
      } else if (isResizingRight) {
        const dx = startXRef.current - e.clientX;
        const screenWidth = window.innerWidth;
        const maxRightWidth = Math.floor(screenWidth * 0.6); // allow up to 60% of screen
        const next = Math.max(40, Math.min(maxRightWidth, startRightWidthRef.current + dx));
        setRightWidth(next);
      }
    };
    const onPointerUp = () => {
      setIsResizingLeft(false);
      setIsResizingRight(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [isResizingLeft, isResizingRight]);

  const startResizeLeft = (e: React.PointerEvent) => {
    setIsResizingLeft(true);
    startXRef.current = e.clientX;
    startLeftWidthRef.current = leftWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    // Do not use setPointerCapture here because we're listening on window for pointermove
  };
  const startResizeRight = (e: React.PointerEvent) => {
    setIsResizingRight(true);
    startXRef.current = e.clientX;
    startRightWidthRef.current = rightWidth;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    // Do not use setPointerCapture here because we're listening on window for pointermove
  };

  const toggleLeftCollapse = () => {
    setLeftWidth(prev => (prev <= 60 ? 380 : 40));
    setActiveLeftPopup(null);
  };
  const toggleRightCollapse = () => {
    setRightWidth(prev => (prev <= 60 ? 320 : 40));
    setActiveRightPopup(null);
  };

  // Zoom and pan interactions
  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null): boolean => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      const editableTags = ['input', 'textarea', 'select'];
      if (editableTags.includes(tag)) return true;
      const contentEditable = (el as HTMLElement).isContentEditable;
      return !!contentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Do not hijack Space when typing in fields
        if (isEditableTarget(e.target) || isEditableTarget(document.activeElement)) return;
        isSpacePressedRef.current = true;
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        isSpacePressedRef.current = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Tick every second to refresh the relative "Saved X ago" label
  useEffect(() => {
    const id = window.setInterval(() => setNowTs(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const timeAgo = (date: Date): string => {
    const seconds = Math.max(0, Math.floor((nowTs - date.getTime()) / 1000));
    if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'} ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  useEffect(() => {
    const el = previewScrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = -e.deltaY; // up to zoom in
        const step = delta > 0 ? 5 : -5;
        setZoom(z => Math.max(25, Math.min(200, z + step)));
      }
    };

    let isPanning = false;
    let startX = 0;
    let startY = 0;
    let scrollLeft = 0;
    let scrollTop = 0;

    const onMouseDown = (e: MouseEvent) => {
      const isMiddle = e.button === 1;
      if (isMiddle || isSpacePressedRef.current) {
        isPanning = true;
        el.classList.add('cursor-grabbing');
        startX = e.clientX;
        startY = e.clientY;
        scrollLeft = el.scrollLeft;
        scrollTop = el.scrollTop;
        e.preventDefault();
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      el.scrollLeft = scrollLeft - dx;
      el.scrollTop = scrollTop - dy;
    };
    const onMouseUp = () => {
      isPanning = false;
      el.classList.remove('cursor-grabbing');
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('wheel', onWheel as EventListener);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const isLeftCollapsed = leftWidth <= 60;
  const isRightCollapsed = rightWidth <= 60;

  // Left sidebar sections for icon rail
  const leftSections: { id: string; title: string; icon: React.ReactNode }[] = [
    { id: 'basics', title: 'Basics', icon: <User className="w-5 h-5" /> },
    { id: 'summary', title: 'Summary', icon: <FileText className="w-5 h-5" /> },
    { id: 'experience', title: 'Experience', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'education', title: 'Education', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'skills', title: 'Skills', icon: <Star className="w-5 h-5" /> },
    { id: 'languages', title: 'Languages', icon: <Globe className="w-5 h-5" /> },
    { id: 'awards', title: 'Awards', icon: <Award className="w-5 h-5" /> },
    { id: 'certifications', title: 'Certifications', icon: <Shield className="w-5 h-5" /> },
    { id: 'interests', title: 'Interests', icon: <Heart className="w-5 h-5" /> },
    { id: 'projects', title: 'Projects', icon: <FolderIcon className="w-5 h-5" /> },
    { id: 'publications', title: 'Publications', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'volunteering', title: 'Volunteering', icon: <Users className="w-5 h-5" /> },
    { id: 'custom', title: 'Custom', icon: <Hash className="w-5 h-5" /> }
  ];

  // Right sidebar sections for icon rail
  const rightSections: { id: 'templates' | 'typography' | 'theme' | 'page'; title: string; icon: React.ReactNode }[] = [
    { id: 'templates', title: 'Templates', icon: <Layout className="w-5 h-5" /> },
    { id: 'typography', title: 'Typography', icon: <Type className="w-5 h-5" /> },
    { id: 'theme', title: 'Theme Colors', icon: <Palette className="w-5 h-5" /> },
    { id: 'page', title: 'Page', icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="font-semibold text-lg">Resume Builder</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Change Template dialog trigger */}
          <Dialog open={templateModalOpen} onOpenChange={setTemplateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Layout className="w-4 h-4" /> Change Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Choose Template</DialogTitle>
              </DialogHeader>
              <TemplateSelection
                selectedTemplate={{ slug: selectedTemplate, id: selectedTemplateId ?? 0 } as any}
                initialTemplateId={selectedTemplateId ?? null}
                onTemplateSelect={handleTemplateDialogSelect}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleLeftCollapse}
            title="Collapse/Expand left panel"
            className="hidden md:inline-flex"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleRightCollapse}
            title="Collapse/Expand right panel"
            className="hidden md:inline-flex"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="min-w-[110px] flex items-center justify-end">
            {isSaving ? (
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            ) : isInitialLoading ? (
              <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
            ) : (
              <div className="text-xs text-gray-500">
                {lastSavedAt ? `Saved ${timeAgo(lastSavedAt)}` : 'Not saved yet'}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-2"
            title="Print (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            Print
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
        </div>

        {/* Collapsed Left Popup and Overlay */}
        {isLeftCollapsed && activeLeftPopup && (
          <>
            {/* Overlay that does not cover the icon rail */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-black/10"
              style={{ left: leftWidth }}
              onClick={() => setActiveLeftPopup(null)}
            />
            {/* Popup panel */}
            <div
              className="absolute z-40 top-2 left-[40px] md:left-[44px]"
              style={{ left: leftWidth }}
            >
              <div className="bg-white border shadow-xl rounded-lg w-[88vw] sm:w-[420px] max-h-[88vh] overflow-auto">
                <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    {(leftSections.find(s => s.id === activeLeftPopup)?.icon) || null}
                    <span className="text-sm font-medium">
                      {leftSections.find(s => s.id === activeLeftPopup)?.title}
                    </span>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-gray-200"
                    onClick={() => setActiveLeftPopup(null)}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  {isInitialLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                          <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ResumeForm
                      data={resumeData}
                      onChange={setResumeData}
                      focusSection={activeLeftPopup}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        {/* Collapsed Right Popup and Overlay */}
        {isRightCollapsed && activeRightPopup && (
          <>
            {/* Overlay that does not cover the right icon rail */}
            <div
              className="absolute top-0 left-0 bottom-0 bg-black/10"
              style={{ right: rightWidth }}
              onClick={() => setActiveRightPopup(null)}
            />
            {/* Popup panel */}
            <div
              className="absolute z-40 top-2"
              style={{ right: rightWidth }}
            >
              <div className="bg-white border shadow-xl rounded-lg w-[88vw] sm:w-[420px] max-h-[88vh] overflow-auto">
                <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50 rounded-t-lg">
                  <div className="flex items-center gap-2">
                    {(rightSections.find(s => s.id === activeRightPopup)?.icon) || null}
                    <span className="text-sm font-medium">
                      {rightSections.find(s => s.id === activeRightPopup)?.title}
                    </span>
                  </div>
                  <button
                    className="p-1 rounded hover:bg-gray-200"
                    onClick={() => setActiveRightPopup(null)}
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3">
                  <StylePanel
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    onTemplateSelect={handleTemplateSelectImmediate}
                    templateSavingId={templateSavingId}
                    theme={theme}
                    onThemeChange={setTheme}
                    typography={typography}
                    onTypographyChange={setTypography}
                    pageSettings={pageSettings}
                    onPageSettingsChange={setPageSettings}
                    focusSection={activeRightPopup || undefined}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-w-0 relative">
        {/* Left Panel - Form */}
        <div className="bg-white border-r flex flex-col flex-none min-h-0" style={{ width: leftWidth }}>
          {!isLeftCollapsed ? (
            <div className="flex-1 overflow-y-auto">
              {isInitialLoading ? (
                <div className="p-4 space-y-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                      <div className="h-9 w-full bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <ResumeForm data={resumeData} onChange={setResumeData} />
              )}
            </div>
          ) : (
            <div className="h-full w-full flex-1 overflow-y-auto flex flex-col items-center py-3 gap-2">
              {leftSections.map((s) => (
                <button
                  key={s.id}
                  className={`w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition ${
                    activeLeftPopup === s.id ? 'bg-gray-100 ring-1 ring-gray-300' : ''
                  }`}
                  title={s.title}
                  onClick={() => setActiveLeftPopup((cur) => (cur === s.id ? null : s.id))}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Left Resize Handle */}
        <div
          onPointerDown={startResizeLeft}
          onDoubleClick={toggleLeftCollapse}
          title="Drag to resize (double-click to collapse/expand)"
          className="w-3.5 md:w-4 self-stretch cursor-col-resize select-none bg-gray-200 hover:bg-gray-300 active:bg-gray-400 z-30 flex-none"
          role="separator"
          aria-orientation="vertical"
          style={{ touchAction: 'none' }}
        >
          <div className="mx-auto my-auto h-full flex items-center">
            <div className="h-10 w-1 bg-gray-600/80 rounded" />
          </div>
        </div>

        {/* Center Panel - Preview */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <PreviewToolbar
            zoom={zoom}
            onZoomChange={setZoom}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onDownload={handleDownload}
            onPrint={handlePrint}
            onSave={handleSave}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            onFullscreen={handleFullscreen}
            onDuplicate={handleDuplicate}
            onClear={handleClear}
          />
          <div ref={previewScrollRef} className="flex-1 overflow-auto p-8 cursor-grab min-w-0">
            <div 
              className="mx-auto transition-transform"
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'top center'
              }}
            >
              {isInitialLoading ? (
                <div className="bg-white shadow-xl w-[794px] h-[1123px] animate-pulse rounded" />
              ) : (
                <div
                  ref={previewRef}
                  style={{
                    fontFamily: typography?.fontFamily || undefined,
                    fontSize: typography?.fontSize ? `${typography.fontSize}px` : undefined,
                    lineHeight: typography?.lineHeight || undefined,
                    letterSpacing: typeof typography?.letterSpacing === 'number' ? `${typography.letterSpacing}px` : undefined
                  }}
                >
                  <TemplateRenderer
                    resumeData={{
                      ...resumeData,
                      template: { slug: selectedTemplate },
                      theme,
                      typography,
                      pageSettings,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Resize Handle (between center and right panel) */}
        <div
          onPointerDown={startResizeRight}
          onDoubleClick={toggleRightCollapse}
          title="Drag to resize (double-click to collapse/expand)"
          className="w-3.5 md:w-4 self-stretch cursor-col-resize select-none bg-gray-200 hover:bg-gray-300 active:bg-gray-400 z-30 ring-0 hover:ring-1 hover:ring-gray-400/60 flex-none"
          role="separator"
          aria-orientation="vertical"
          style={{ touchAction: 'none' }}
        >
          <div className="mx-auto my-auto h-full flex items-center">
            <div className="h-10 w-1 bg-gray-700/80 rounded" />
          </div>
        </div>
        {/* Right Panel - Styling */}
        <div className="bg-white border-l flex-none" style={{ width: rightWidth }}>
          {!isRightCollapsed ? (
            <StylePanel
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
              onTemplateSelect={handleTemplateSelectImmediate}
              templateSavingId={templateSavingId}
              theme={theme}
              onThemeChange={setTheme}
              typography={typography}
              onTypographyChange={setTypography}
              pageSettings={pageSettings}
              onPageSettingsChange={setPageSettings}
            />
          ) : (
            <div className="h-full w-full flex flex-col items-center py-3 gap-2">
              {rightSections.map((s) => (
                <button
                  key={s.id}
                  className={`w-8 h-8 rounded-md flex items-center justify-center hover:bg-gray-100 transition ${
                    activeRightPopup === s.id ? 'bg-gray-100 ring-1 ring-gray-300' : ''
                  }`}
                  title={s.title}
                  onClick={() => setActiveRightPopup((cur) => (cur === s.id ? null : s.id))}
                >
                  {s.icon}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
