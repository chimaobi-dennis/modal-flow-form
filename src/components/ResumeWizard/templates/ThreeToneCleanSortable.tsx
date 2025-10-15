import React from 'react';
import { DndContext, PointerSensor, KeyboardSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TemplateProps } from '../TemplateRegistry';

// A4 sizes in millimeters
const A4_MM_WIDTH = 210;
const A4_MM_HEIGHT = 297;

// Internal types to match the provided snippet exactly
type ResumeItem = { title?: string; subtitle?: string; location?: string; date?: string; bullets?: string[] };
export type ResumeData = {
  fullName?: string;
  role?: string;
  summary?: string;
  imageUrl?: string;
  contact?: { phone?: string; email?: string; website?: string | URL; address?: string };
  experience?: ResumeItem[];
  awards?: { title?: string; subtitle?: string; date?: string; bullets?: string[] }[];
  references?: { name?: string; role?: string; email?: string; phone?: string }[];
  education?: { title?: string; date?: string; subtitle?: string; location?: string }[];
  skills?: string[];
  languages?: string[];
};

// This component preserves the exact JSX/markup structure as provided by the user for the visual template
function PureResumeTemplate({ data }: { data: ResumeData }) {
  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center p-6 print:p-0">
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { height: 100%; }
          .no-print-shadow { box-shadow: none !important; }
        }
      `}</style>

      <article
        className="no-print-shadow bg-white text-black shadow-2xl print:shadow-none template-ttcs"
        style={{ width: `${A4_MM_WIDTH}mm`, height: `${A4_MM_HEIGHT}mm` }}
      >
        {/* Outer padding to mimic clean margins */}
        <div className="h-full flex flex-col">
          {/* HEADER */}
          <header className="px-10 pt-10">
            <div className="grid grid-cols-12 items-start gap-6">
              {/* Name + Role + Summary */}
              <div className="col-span-9">
                <h1 className="text-3xl font-bold tracking-wide">{data.fullName}</h1>
                <p className="text-sm mt-1 opacity-80">{data.role}</p>
                {data.summary && (
                  <p className="mt-5 text-[12px] leading-6 text-black/90 max-w-3xl">
                    {data.summary}
                  </p>
                )}
              </div>

              {/* Round Photo */}
              <div className="col-span-3 flex justify-end">
                {data.imageUrl && (
                  <img
                    src={data.imageUrl}
                    alt={data.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"
                  />
                )}
              </div>
            </div>
          </header>

          {/* subtle divider */}
          <div className="px-10 mt-6">
            <div className="h-px bg-black/10" />
          </div>

          {/* BODY: two columns with in-place sortable contexts */}
          <div className="grid grid-cols-12 gap-8 px-10 pt-6 pb-10">
            <section className="col-span-8 space-y-8" id="left-column">
              <DndContext sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor))} onDragEnd={() => {}}>
                <SortableContext items={[]} strategy={verticalListSortingStrategy}>
                  <div>{/* Sections will be rendered by the parent component */}</div>
                </SortableContext>
              </DndContext>
            </section>
            <aside className="col-span-4 space-y-8" id="right-column">
              <DndContext sensors={useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor))} onDragEnd={() => {}}>
                <SortableContext items={[]} strategy={verticalListSortingStrategy}>
                  <div>{/* Sections will be rendered by the parent component */}</div>
                </SortableContext>
              </DndContext>
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
}

function SectionHeading({ label, right }: { label: string; right?: boolean }) {
  return (
    <div className={`flex ${right ? "justify-start" : "justify-start"} items-center gap-3`}>
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/90">{label}</h3>
      <div className="flex-1 h-px bg-black/10" />
    </div>
  );
}

function Item({ it }: { it: ResumeItem }) {
  return (
    <div>
      <div className="flex items-start justify-between">
        <h4 className="text-[13px] font-semibold leading-tight">{it.title}</h4>
        {it.date && <p className="text-[11px] opacity-70">{it.date}</p>}
      </div>
      {(it.subtitle || it.location) && (
        <p className="text-[11px] opacity-80">{[it.subtitle, it.location].filter(Boolean).join(" · ")}</p>
      )}
      {it.bullets && it.bullets.length > 0 && (
        <ul className="mt-2 list-disc pl-4 text-[12px] space-y-1">
          {it.bullets.map((b, i) => (
            <li key={i} className="leading-relaxed">{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Sortable wrapper used for both columns
function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: 'grab',
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

// Adapter that maps TemplateProps.resumeData to the data shape expected by PureResumeTemplate,
// injects theming (primary/secondary/accent), and enables left/right sortable sections
export const ThreeToneCleanSortable: React.FC<TemplateProps> = ({ resumeData }) => {
  const rd = resumeData || {};
  const root = rd.content || rd;

  const theme = root.theme || rd.theme || {};
  const primary = theme.primary || '#0f172a'; // all text
  const secondary = theme.secondary || theme.headingColor || '#334155'; // headers
  const accent = theme.accent || '#0284c7'; // icons, lines, demarcators

  // Build "data" for the pure template (keeping markup exactly as provided)
  const person = root.personal || root.basics || {};
  const fullName = person.fullName || person.name || [person.firstName, person.lastName].filter(Boolean).join(' ');
  const role = person.role || person.title || person.label || '';

  const data: ResumeData = {
    fullName,
    role,
    summary: root.summary || root.objective || person.summary || rd.summary || '',
    imageUrl: person.imageUrl || person.picture || person.avatar || '',
    contact: {
      phone: person.phone || person.tel || '',
      email: person.email || '',
      website: person.website || person.url || '',
      address: person.address || person.location || '',
    },
    experience: Array.isArray(root.experience) ? root.experience : (Array.isArray(root.work) ? root.work.map((w: any) => ({
      title: w.position || w.title,
      subtitle: w.company,
      location: w.location,
      date: [w.startDate || w.start, (w.isCurrentRole || w.current || w.present) ? 'Present' : (w.endDate || w.end)].filter(Boolean).join(' – '),
      bullets: Array.isArray(w.descriptions) ? w.descriptions : String(w.description || '').split('\n').filter(Boolean),
    })) : []),
    awards: Array.isArray(root.awards) ? root.awards : [],
    references: Array.isArray(root.references) ? root.references : [],
    education: Array.isArray(root.education) ? root.education.map((e: any) => ({
      title: e.title || e.degree || '',
      subtitle: e.subtitle || e.school || e.institution || '',
      location: e.location || '',
      date: [e.startDate || e.startYear, e.endDate || e.endYear].filter(Boolean).join(' – '),
    })) : [],
    skills: Array.isArray(root.skills) ? root.skills.map((s: any) => (typeof s === 'string' ? s : (s?.name || s?.label || ''))) : [],
    languages: Array.isArray(root.languages) ? root.languages.map((l: any) => (typeof l === 'string' ? l : (l?.name || l?.language || ''))) : [],
  };

  // Section ordering: default to the natural order sections appear in resume data.
  // We include only sections supported by this template and that have data.
  // Summary, Contact, and Image are excluded from the ordering rule; Contact (if present) is rendered but not sortable.
  const keyMap = new Map<string, string>([
    ['experience','experience'], ['work','experience'], ['employment','experience'],
    ['awards','awards'], ['honors','awards'],
    ['references','references'], ['refs','references'],
    ['contact','contact'], ['basics','contact'], ['personal','contact'],
    ['education','education'],
    ['skills','skills'], ['technical_skills','skills'],
    ['languages','languages'], ['language','languages']
  ]);
  const supportedKeysLeft = ['experience','awards','references'];
  const supportedKeysRight = ['contact','education','skills','languages'];
  const supportedKeys = [...supportedKeysLeft, ...supportedKeysRight];
  const hasData = (k: string): boolean => {
    switch (k) {
      case 'experience': return !!(data.experience && data.experience.length);
      case 'awards': return !!(data.awards && data.awards.length);
      case 'references': return !!(data.references && data.references.length);
      case 'contact': return !!(data.contact && (data.contact.phone || data.contact.email || data.contact.website || data.contact.address));
      case 'education': return !!(data.education && data.education.length);
      case 'skills': return !!(data.skills && data.skills.length);
      case 'languages': return !!(data.languages && data.languages.length);
      default: return false;
    }
  };
  // Determine natural order from the incoming resume root object key insertion order
  const naturalOrderSource = Object.keys(root || {});
  const normalizedNatural = naturalOrderSource
    .map(k => keyMap.get(String(k).toLowerCase()) || null)
    .filter(Boolean) as string[];
  const dedupedNatural = normalizedNatural.filter((k, i, a) => a.indexOf(k) === i);
  const hasContactData = hasData('contact');
  // Build the visible order preferring natural appearance order; fallback to template-supported order
  const ordered = (dedupedNatural.length ? dedupedNatural : supportedKeys)
    .filter(hasData);
  // Exclude contact from the sortable order; it will be rendered separately if present
  const orderedNoContact = ordered.filter(k => k !== 'contact');
  // Cap to template's max supported sortable sections (exclude contact from count)
  const maxSortable = supportedKeys.filter(k => k !== 'contact').length;
  const limited = orderedNoContact.slice(0, maxSortable);
  const leftInitial = limited.filter(k => supportedKeysLeft.includes(k));
  const rightInitial = limited.filter(k => supportedKeysRight.includes(k));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const [leftOrder, setLeftOrder] = React.useState<string[]>(leftInitial);
  const [rightOrder, setRightOrder] = React.useState<string[]>(rightInitial);
  React.useEffect(() => {
    setLeftOrder(leftInitial);
    setRightOrder(rightInitial);
    // Report current sections to host (ResumeForm) for sector UI
    try {
      const remaining = supportedKeys.filter(k => k !== 'contact' && !leftInitial.includes(k) && !rightInitial.includes(k));
      const detail = { left: leftInitial, right: rightInitial, unused: remaining, supportsTwoColumns: true };
      window.dispatchEvent(new CustomEvent('resume:reportSections', { detail }));
      window.parent?.postMessage({ type: 'resume:reportSections', ...detail }, '*');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root]);

  // Accept external updates from ResumeForm to set section placements
  React.useEffect(() => {
    const handler = (evt: Event) => {
      const e = evt as CustomEvent<any>;
      const payload = e.detail || {};
      const leftArr: string[] | undefined = Array.isArray(payload.left) ? payload.left : undefined;
      const rightArr: string[] | undefined = Array.isArray(payload.right) ? payload.right : undefined;
      const sanitize = (arr?: string[]) => (arr || [])
        .map(String)
        .filter(k => k !== 'contact' && supportedKeys.includes(k));
      if (leftArr || rightArr) {
        const newLeft = sanitize(leftArr) || leftOrder;
        const newRight = sanitize(rightArr) || rightOrder;
        setLeftOrder(newLeft);
        setRightOrder(newRight);
      }
    };
    window.addEventListener('resume:setSections', handler as EventListener);
    return () => window.removeEventListener('resume:setSections', handler as EventListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportedKeys.join(','), leftOrder.join(','), rightOrder.join(',')]);

  const onDragEnd = (which: 'left' | 'right') => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = which === 'left' ? leftOrder : rightOrder;
    const oldIndex = current.indexOf(String(active.id));
    const newIndex = current.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const updated = arrayMove(current, oldIndex, newIndex);
    if (which === 'left') setLeftOrder(updated); else setRightOrder(updated);
    // Merge new full order and notify host
    const other = which === 'left' ? rightOrder : leftOrder;
    const merged = which === 'left' ? [...updated, ...other] : [...leftOrder, ...updated];
    const remaining = supportedKeys.filter(k => !merged.includes(k));
    const newFull = [...merged, ...remaining].slice(0, maxSortable);
    try {
      window.dispatchEvent(new CustomEvent('resume:reorderSections', { detail: { order: newFull } }));
      window.parent?.postMessage({ type: 'resume:reorderSections', order: newFull }, '*');
      // Also report current sector state
      const unused = supportedKeys.filter(k => k !== 'contact' && !updated.includes(k) && !other.includes(k));
      const detail = { left: which === 'left' ? updated : leftOrder, right: which === 'right' ? updated : rightOrder, unused, supportsTwoColumns: true };
      window.dispatchEvent(new CustomEvent('resume:reportSections', { detail }));
      window.parent?.postMessage({ type: 'resume:reportSections', ...detail }, '*');
    } catch {}
  };

  // Theming: inject CSS variables and override colors without changing markup
  const cssVars: React.CSSProperties = {
    ['--primary' as any]: primary,
    ['--secondary' as any]: secondary,
    ['--accent' as any]: accent,
  };

  // Render a single article keeping original markup; insert sortable wrappers in place
  return (
    <div style={cssVars}>
      <style>{`
        .template-ttcs { color: var(--primary); }
        .template-ttcs h1, .template-ttcs p, .template-ttcs li, .template-ttcs span, .template-ttcs h4 { color: var(--primary); }
        .template-ttcs h3 { color: var(--secondary) !important; }
        .template-ttcs .h-px { background-color: color-mix(in oklab, var(--accent) 30%, transparent) !important; }
        .template-ttcs #left-column li.relative > span:first-child { background-color: var(--accent) !important; }
        .template-ttcs #left-column li.relative > span:nth-of-type(2) { background-color: color-mix(in oklab, var(--accent) 30%, transparent) !important; }
      `}</style>

      <article className="no-print-shadow bg-white text-black shadow-2xl print:shadow-none template-ttcs" style={{ width: `${A4_MM_WIDTH}mm`, height: `${A4_MM_HEIGHT}mm` }}>
        <div className="h-full flex flex-col">
          <PureHeader data={data} />
          <div className="px-10 mt-6"><div className="h-px bg-black/10" /></div>
          <div className="grid grid-cols-12 gap-8 px-10 pt-6 pb-10">
            <section className="col-span-8 space-y-8" id="left-column">
              <DndContext sensors={sensors} onDragEnd={onDragEnd('left')}>
                <SortableContext items={leftOrder} strategy={verticalListSortingStrategy}>
                  {leftOrder.map((k) => {
                    if (k === 'experience') {
                      return (
                        <SortableSection key={k} id={k}>
                          <div data-section-key="experience">
                            <SectionHeading label="Work Experience" />
                            <ul className="mt-4">
                              {data.experience!.map((it, idx) => (
                                <li key={idx} className="relative pl-6 pb-6 last:pb-0">
                                  <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-black" />
                                  {idx !== data.experience!.length - 1 && (
                                    <span className="absolute left-0.5 top-3 w-px h-[calc(100%-0.5rem)] bg-black/20" />
                                  )}
                                  <Item it={it} />
                                </li>
                              ))}
                            </ul>
                          </div>
                        </SortableSection>
                      );
                    }
                    if (k === 'awards') {
                      return (
                        <SortableSection key={k} id={k}>
                          <div data-section-key="awards">
                            <SectionHeading label="Awards" />
                            <div className="mt-4 space-y-5">
                              {data.awards!.map((it, i) => (
                                <div key={i}>
                                  <div className="flex items-start justify-between">
                                    <h4 className="text-[13px] font-semibold leading-tight">{it.title}</h4>
                                    {it.date && <p className="text-[11px] opacity-70">{it.date}</p>}
                                  </div>
                                  {it.subtitle && (
                                    <p className="text-[11px] opacity-80 mt-0.5">{it.subtitle}</p>
                                  )}
                                  {it.bullets && it.bullets.length > 0 && (
                                    <ul className="mt-2 list-disc pl-4 text-[12px] space-y-1">
                                      {it.bullets.map((b, j) => (
                                        <li key={j} className="leading-relaxed">{b}</li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </SortableSection>
                      );
                    }
                    if (k === 'references') {
                      return (
                        <SortableSection key={k} id={k}>
                          <div data-section-key="references">
                            <SectionHeading label="Reference" />
                            <div className="mt-4 grid grid-cols-2 gap-6 text-[12px]">
                              {data.references!.map((r, i) => (
                                <div key={i}>
                                  <p className="font-semibold">{r.name}</p>
                                  {r.role && <p className="opacity-80">{r.role}</p>}
                                  {r.email && <p className="mt-1">{r.email}</p>}
                                  {r.phone && <p>{r.phone}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </SortableSection>
                      );
                    }
                    return null;
                  })}
                </SortableContext>
              </DndContext>
            </section>
            <aside className="col-span-4 space-y-8" id="right-column">
              {/* Contact is rendered fixed (non-sortable) if present */}
              {hasContactData && data.contact && (
                <div data-section-key="contact">
                  <SectionHeading label="Contact" right />
                  <div className="mt-3 text-[12px] space-y-1">
                    {data.contact.phone && <p>Phone<br/><span className="opacity-80">{data.contact.phone}</span></p>}
                    {data.contact.email && <p className="mt-2">Email<br/><span className="opacity-80">{data.contact.email}</span></p>}
                    {data.contact.website && <p className="mt-2">Website<br/><span className="opacity-80">{String(data.contact.website)}</span></p>}
                    {data.contact.address && <p className="mt-2">Address<br/><span className="opacity-80">{data.contact.address}</span></p>}
                  </div>
                </div>
              )}
              <DndContext sensors={sensors} onDragEnd={onDragEnd('right')}>
                <SortableContext items={rightOrder} strategy={verticalListSortingStrategy}>
                  {rightOrder.map((k) => {
                    if (k === 'education') {
                      return (
                        <SortableSection key={k} id={k}>
                          <div data-section-key="education">
                            <SectionHeading label="Education" right />
                            <div className="mt-3 space-y-4">
                              {data.education!.map((it, i) => (
                                <div key={i}>
                                  <div className="flex items-start justify-between">
                                    <p className="text-[12px] font-semibold leading-tight">{it.title}</p>
                                    {it.date && <span className="text-[11px] opacity-70">{it.date}</span>}
                                  </div>
                                  {(it.subtitle || it.location) && (
                                    <p className="text-[11px] opacity-80">{[it.subtitle, it.location].filter(Boolean).join(' · ')}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </SortableSection>
                      );
                    }
                    if (k === 'skills') {
                      return (
                        <SortableSection key={k} id={k}>
                          <div data-section-key="skills">
                            <SectionHeading label="Skills" right />
                            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                              {data.skills!.map((s, i) => (
                                <li key={i} className="list-disc ml-4">{s}</li>
                              ))}
                            </ul>
                          </div>
                        </SortableSection>
                      );
                    }
                    if (k === 'languages') {
                      return (
                        <SortableSection key={k} id={k}>
                          <div data-section-key="languages">
                            <SectionHeading label="Language" right />
                            <ul className="mt-3 space-y-1 text-[12px]">
                              {data.languages!.map((l, i) => (
                                <li key={i}>{l}</li>
                              ))}
                            </ul>
                          </div>
                        </SortableSection>
                      );
                    }
                    return null;
                  })}
                </SortableContext>
              </DndContext>
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
} 

// Renders the PureResumeTemplate but swaps the section containers into SortableSection wrappers
function PureRenderer({ side, order, data }: { side: 'left'|'right'; order: string[]; data: ResumeData }) {
  // We render the full PureResumeTemplate once, but we intercept sections by keys.
  // To keep the provided markup untouched, we mirror its structure and only wrap each section.
  if (side === 'left') {
    return (
      <div className="w-full min-h-screen bg-transparent">
        <article className="template-ttcs" style={{ width: `${A4_MM_WIDTH}mm`, height: `${A4_MM_HEIGHT}mm`, margin: '0 auto' }}>
          <div className="h-full flex flex-col">
            {/* Header and divider come from the pure component to remain identical */}
            <PureHeader data={data} />
            <div className="px-10 mt-6"><div className="h-px bg-black/10" /></div>
            <div className="grid grid-cols-12 gap-8 px-10 pt-6 pb-10">
              <section className="col-span-8 space-y-8" id="left-column">
                {order.map((k) => {
                  if (k === 'experience' && data.experience && data.experience.length) {
                    return (
                      <SortableSection key={k} id={k}>
                        <div data-section-key="experience">
                          <SectionHeading label="Work Experience" />
                          <ul className="mt-4">
                            {data.experience.map((it, idx) => (
                              <li key={idx} className="relative pl-6 pb-6 last:pb-0">
                                <span className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-black" />
                                {idx !== data.experience!.length - 1 && (
                                  <span className="absolute left-0.5 top-3 w-px h-[calc(100%-0.5rem)] bg-black/20" />
                                )}
                                <Item it={it} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      </SortableSection>
                    );
                  }
                  if (k === 'awards' && data.awards && data.awards.length) {
                    return (
                      <SortableSection key={k} id={k}>
                        <div data-section-key="awards">
                          <SectionHeading label="Awards" />
                          <div className="mt-4 space-y-5">
                            {data.awards.map((it, i) => (
                              <div key={i}>
                                <div className="flex items-start justify-between">
                                  <h4 className="text-[13px] font-semibold leading-tight">{it.title}</h4>
                                  {it.date && <p className="text-[11px] opacity-70">{it.date}</p>}
                                </div>
                                {it.subtitle && (
                                  <p className="text-[11px] opacity-80 mt-0.5">{it.subtitle}</p>
                                )}
                                {it.bullets && it.bullets.length > 0 && (
                                  <ul className="mt-2 list-disc pl-4 text-[12px] space-y-1">
                                    {it.bullets.map((b, j) => (
                                      <li key={j} className="leading-relaxed">{b}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </SortableSection>
                    );
                  }
                  if (k === 'references' && data.references && data.references.length) {
                    return (
                      <SortableSection key={k} id={k}>
                        <div data-section-key="references">
                          <SectionHeading label="Reference" />
                          <div className="mt-4 grid grid-cols-2 gap-6 text-[12px]">
                            {data.references.map((r, i) => (
                              <div key={i}>
                                <p className="font-semibold">{r.name}</p>
                                {r.role && <p className="opacity-80">{r.role}</p>}
                                {r.email && <p className="mt-1">{r.email}</p>}
                                {r.phone && <p>{r.phone}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </SortableSection>
                    );
                  }
                  return null;
                })}
              </section>

              {/* Right column will be rendered by the right renderer instance */}
              <aside className="col-span-4 space-y-8" id="right-column" />
            </div>
          </div>
        </article>
      </div>
    );
  }

  // right side renderer (keeps identical markup)
  return (
    <div className="w-full min-h-screen bg-transparent">
      <article className="template-ttcs" style={{ width: `${A4_MM_WIDTH}mm`, height: `${A4_MM_HEIGHT}mm`, margin: '0 auto' }}>
        <div className="h-full flex flex-col">
          <PureHeader data={data} />
          <div className="px-10 mt-6"><div className="h-px bg-black/10" /></div>
          <div className="grid grid-cols-12 gap-8 px-10 pt-6 pb-10">
            <section className="col-span-8 space-y-8" id="left-column" />
            <aside className="col-span-4 space-y-8" id="right-column">
              {order.map((k) => {
                if (k === 'contact' && data.contact && (data.contact.phone || data.contact.email || data.contact.website || data.contact.address)) {
                  return (
                    <SortableSection key={k} id={k}>
                      <div data-section-key="contact">
                        <SectionHeading label="Contact" right />
                        <div className="mt-3 text-[12px] space-y-1">
                          {data.contact.phone && <p>Phone<br/><span className="opacity-80">{data.contact.phone}</span></p>}
                          {data.contact.email && <p className="mt-2">Email<br/><span className="opacity-80">{data.contact.email}</span></p>}
                          {data.contact.website && <p className="mt-2">Website<br/><span className="opacity-80">{String(data.contact.website)}</span></p>}
                          {data.contact.address && <p className="mt-2">Address<br/><span className="opacity-80">{data.contact.address}</span></p>}
                        </div>
                      </div>
                    </SortableSection>
                  );
                }
                if (k === 'education' && data.education && data.education.length) {
                  return (
                    <SortableSection key={k} id={k}>
                      <div data-section-key="education">
                        <SectionHeading label="Education" right />
                        <div className="mt-3 space-y-4">
                          {data.education.map((it, i) => (
                            <div key={i}>
                              <div className="flex items-start justify-between">
                                <p className="text-[12px] font-semibold leading-tight">{it.title}</p>
                                {it.date && <span className="text-[11px] opacity-70">{it.date}</span>}
                              </div>
                              {(it.subtitle || it.location) && (
                                <p className="text-[11px] opacity-80">{[it.subtitle, it.location].filter(Boolean).join(' · ')}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </SortableSection>
                  );
                }
                if (k === 'skills' && data.skills && data.skills.length) {
                  return (
                    <SortableSection key={k} id={k}>
                      <div data-section-key="skills">
                        <SectionHeading label="Skills" right />
                        <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
                          {data.skills.map((s, i) => (
                            <li key={i} className="list-disc ml-4">{s}</li>
                          ))}
                        </ul>
                      </div>
                    </SortableSection>
                  );
                }
                if (k === 'languages' && data.languages && data.languages.length) {
                  return (
                    <SortableSection key={k} id={k}>
                      <div data-section-key="languages">
                        <SectionHeading label="Language" right />
                        <ul className="mt-3 space-y-1 text-[12px]">
                          {data.languages.map((l, i) => (
                            <li key={i}>{l}</li>
                          ))}
                        </ul>
                      </div>
                    </SortableSection>
                  );
                }
                return null;
              })}
            </aside>
          </div>
        </div>
      </article>
    </div>
  );
}

function PureHeader({ data }: { data: ResumeData }) {
  return (
    <header className="px-10 pt-10">
      <div className="grid grid-cols-12 items-start gap-6">
        <div className="col-span-9">
          <h1 className="text-3xl font-bold tracking-wide">{data.fullName}</h1>
          <p className="text-sm mt-1 opacity-80">{data.role}</p>
          {data.summary && (
            <p className="mt-5 text-[12px] leading-6 text-black/90 max-w-3xl">
              {data.summary}
            </p>
          )}
        </div>
        <div className="col-span-3 flex justify-end">
          {data.imageUrl && (
            <img src={data.imageUrl} alt={data.fullName} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow" />
          )}
        </div>
      </div>
    </header>
  );
}

export default ThreeToneCleanSortable;
