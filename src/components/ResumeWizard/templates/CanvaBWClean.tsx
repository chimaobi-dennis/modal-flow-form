import React from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, KeyboardSensor, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { TemplateProps } from '../TemplateRegistry';

// A4 sizes in millimeters
const A4_MM_WIDTH = 210;
const A4_MM_HEIGHT = 297;

// Canva-style Black & White Clean template with left black aside and right content
export const CanvaBWClean: React.FC<TemplateProps> = ({ resumeData }) => {
  const rd = resumeData || {};
  const root = rd.content || rd;

  const theme = root.theme || rd.theme || {};
  const typo = root.typography || rd.typography || {};

  const primary = theme.primary || '#111111';
  const headingColor = theme.headingColor || primary || '#111111';
  const textColor = theme.textColor || '#1f2937'; // gray-800
  const secondary = theme.secondary || '#64748b'; // slate-500

  const fontFamily = typo.fontFamily || 'Inter';
  const fontSize = Number(typo.fontSize ?? 14);
  const lineHeight = Number(typo.lineHeight ?? 1.5);
  const letterSpacing = Number(typo.letterSpacing ?? 0);

  // Helpers
  const toMonthYear = (v: any): string | undefined => {
    if (!v) return undefined;
    const s = String(v).trim();
    if (!s) return undefined;
    if (/^present$/i.test(s)) return 'Present';
    if (/^\d{4}$/.test(s)) return s; // year only
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const month = d.toLocaleString('en-US', { month: 'long' });
      const year = d.getFullYear();
      return `${month}, ${year}`;
    }
    return s;
  };

  // Sortable wrapper for right sections
  function SortableSection({ id, index, children }: { id: string; index: number; children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.9 : 1,
      cursor: 'grab',
    };
    return (
      <section ref={setNodeRef} style={style} className={index === 0 ? 'pt-10' : 'pt-6'} {...attributes} {...listeners}>
        {children}
      </section>
    );
  }

  // Renderer for right-column sections in current order
  function renderRightSection(key: string): React.ReactNode {
    switch (key) {
      case 'summary':
        return (
          visible.has('summary') && summary ? (
            <div className="px-10 pb-6">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-black/80">Profile</h2>
              <p className="mt-2 text-[12px] leading-6 text-black/90">{summary}</p>
              <div className="mt-4 h-px bg-black/10" />
            </div>
          ) : null
        );
      case 'experience':
        return (
          visible.has('experience') && Array.isArray(experiences) && experiences.length > 0 ? (
            <div className="px-10">
              <Header label="Experience" />
              <ul className="mt-4 space-y-5">
                {experiences.map((item: any, i: number) => (
                  <li key={i}><Item title={item.position || 'Role'} subtitle={item.company} location={item.location} date={formatDateRange(item.startDate || item.start, item.endDate || item.end, item)} bullets={Array.isArray(item.descriptions) ? item.descriptions : splitLines(String(item.description || ''), 8)} /></li>
                ))}
              </ul>
            </div>
          ) : null
        );
      case 'education':
        return (
          visible.has('education') && Array.isArray(educationList) && educationList.length > 0 ? (
            <div className="px-10">
              <Header label="Education" />
              <ul className="mt-4 space-y-5">
                {educationList.map((edu: any, i: number) => (
                  <li key={i}><Item title={edu.degree || 'Degree'} subtitle={[edu.institution || edu.school, edu.field || edu.fieldOfStudy].filter(Boolean).join(' • ')} date={[toMonthYear(edu.startDate || edu.startYear), toMonthYear(edu.endDate || edu.endYear)].filter(Boolean).join(' – ')} /></li>
                ))}
              </ul>
            </div>
          ) : null
        );
      case 'projects':
        return (
          visible.has('projects') && Array.isArray(projects) && projects.length > 0 ? (
            <div className="px-10">
              <Header label="Projects" />
              <ul className="mt-4 space-y-5">
                {projects.map((p: any, i: number) => (
                  <li key={i}><Item title={p.name || p.title || 'Project'} subtitle={[p.role, p.url].filter(Boolean).join(' • ')} date={formatDateRange(p.startDate || p.start, p.endDate || p.end, p)} bullets={Array.isArray(p.highlights) ? p.highlights : splitLines(String(p.description || ''), 8)} /></li>
                ))}
              </ul>
            </div>
          ) : null
        );
      case 'certifications':
        return (
          visible.has('certifications') && Array.isArray(certifications) && certifications.length > 0 ? (
            <div className="px-10 pb-10">
              <Header label="Certifications" />
              <ul className="mt-4 space-y-5">
                {certifications.map((c: any, i: number) => (
                  <li key={i}><Item title={c.name || c.title || 'Certification'} subtitle={[c.issuer, c.authority].filter(Boolean).join(' • ')} date={toMonthYear(c.date || c.issued || c.startDate)} /></li>
                ))}
              </ul>
            </div>
          ) : null
        );
      default:
        return null;
    }
  }
  const formatDateRange = (start?: any, end?: any, flags?: any): string => {
    const isPresent = !!(flags?.isCurrentRole || flags?.current || flags?.present);
    const s = toMonthYear(start);
    const e = isPresent ? 'Present' : toMonthYear(end);
    if (s && e) return `${s} – ${e}`;
    if (s) return s;
    return e || '';
  };

  // Data accessors (support both root.* and content.* structures)
  const person = root.personal || root.personalInfo || root.basics || {};
  const name = person.name || [person.fullName, person.lastName].filter(Boolean).join(' ') || 'Your Name';
  const title = person.title || person.label || '';

  const contact = {
    email: person.email || person.mail || '',
    phone: person.phone || person.tel || '',
    location: person.location || person.address || person.city || '',
    website: person.website || person.url || '',
    linkedin: person.linkedin || person.social?.linkedin || '',
    github: person.github || person.social?.github || '',
  };

  const summary = root.summary || root.objective || person.summary || '';

  const experiences = Array.isArray(root.experience?.items)
    ? root.experience.items
    : (Array.isArray(root.experience) ? root.experience : (Array.isArray(root.work) ? root.work : []));

  const educationList = Array.isArray(root.education?.items)
    ? root.education.items
    : (Array.isArray(root.education) ? root.education : []);

  const skills = Array.isArray(root.skills?.items)
    ? root.skills.items
    : (Array.isArray(root.skills) ? root.skills : []);

  // Additional sections (robust data-shape handling)
  const languages = Array.isArray(root.languages?.items)
    ? root.languages.items
    : (Array.isArray(root.languages) ? root.languages : []);

  const projects = Array.isArray(root.projects?.items)
    ? root.projects.items
    : (Array.isArray(root.projects) ? root.projects : []);

  const certifications = Array.isArray(root.certifications?.items)
    ? root.certifications.items
    : (Array.isArray(root.certifications) ? root.certifications : []);

  const awards = Array.isArray(root.awards?.items)
    ? root.awards.items
    : (Array.isArray(root.awards) ? root.awards : []);

  const publications = Array.isArray(root.publications?.items)
    ? root.publications.items
    : (Array.isArray(root.publications) ? root.publications : []);

  const volunteer = Array.isArray(root.volunteer?.items)
    ? root.volunteer.items
    : (Array.isArray(root.volunteer) ? root.volunteer : []);

  const courses = Array.isArray(root.courses?.items)
    ? root.courses.items
    : (Array.isArray(root.courses) ? root.courses : []);

  const references = Array.isArray(root.references?.items)
    ? root.references.items
    : (Array.isArray(root.references) ? root.references : []);

  const interests = Array.isArray(root.interests?.items)
    ? root.interests.items
    : (Array.isArray(root.interests) ? root.interests : []);

  // Local helpers
  const splitLines = (text: string, maxLines = 8) =>
    String(text || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, maxLines);

  // Section ordering and gating based on API sectionOrder and template-supported sections
  const rawSectionOrder: any = (root as any).sectionOrder || (rd as any).sectionOrder;
  const orderArr: string[] = Array.isArray(rawSectionOrder) ? rawSectionOrder : [];
  // Map API keys to this template's supported keys
  const keyMap = new Map<string, string>([
    // Profile/Summary variants
    ['profile', 'summary'],
    ['summary', 'summary'],
    ['objective', 'summary'],
    ['about', 'summary'],
    ['profile_summary', 'summary'],

    // Basics/Contact variants
    ['basics', 'basics'],
    ['contact', 'basics'],
    ['contacts', 'basics'],
    ['personal', 'basics'],

    // Skills variants
    ['skills', 'skills'],
    ['tech_skills', 'skills'],

    // Languages variants
    ['languages', 'languages'],
    ['language', 'languages'],
    ['langs', 'languages'],

    // Experience/Work variants
    ['experience', 'experience'],
    ['experiences', 'experience'],
    ['work', 'experience'],
    ['employment', 'experience'],
    ['professional_experience', 'experience'],

    // Education
    ['education', 'education'],

    // Projects
    ['projects', 'projects'],

    // Certifications/Certificates variants
    ['certifications', 'certifications'],
    ['certificates', 'certifications'],
    ['certs', 'certifications'],
  ]);
  const supportedKeys = Array.from(new Set(Array.from(keyMap.values())));
  const maxSections = supportedKeys.length; // Template-supported section count
  const normalizedOrder = orderArr
    .map(k => keyMap.get(String(k).toLowerCase()) || null)
    .filter(Boolean) as string[];
  const visibleOrder = (normalizedOrder.length ? normalizedOrder : supportedKeys)
    .filter((k, i, a) => a.indexOf(k) === i)
    .slice(0, maxSections);
  const visible = new Set<string>(visibleOrder);

  // Partition keys by template zones
  const leftKeys = ['basics', 'skills', 'languages'];
  const rightKeys = ['summary', 'experience', 'education', 'projects', 'certifications'];
  const leftOrder = visibleOrder.filter(k => leftKeys.includes(k));
  const rightOrderInitial = visibleOrder.filter(k => rightKeys.includes(k));

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );

  const [rightOrder, setRightOrder] = React.useState<string[]>(rightOrderInitial);
  React.useEffect(() => {
    // keep in sync if sectionOrder changes externally
    setRightOrder(rightOrderInitial);
  }, [root, rd]);

  const handleRightDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = rightOrder.indexOf(String(active.id));
    const newIndex = rightOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const newRight = arrayMove(rightOrder, oldIndex, newIndex);
    setRightOrder(newRight);
    // Recompose full order: keep leftOrder as-is, then newRight, then any remaining supported not shown
    const remaining = supportedKeys.filter(k => !leftOrder.includes(k) && !newRight.includes(k));
    const newFull = [...leftOrder, ...newRight, ...remaining].slice(0, maxSections);
    // Notify host (ResumeBuilder) to update sectionOrder
    try {
      window.dispatchEvent(new CustomEvent('resume:reorderSections', { detail: { order: newFull } }));
      window.parent?.postMessage({ type: 'resume:reorderSections', order: newFull }, '*');
    } catch (e) {}
  };

  // CSS variables for theming/typography scoped to this template root
  const cssVars: React.CSSProperties = {
    // colors
    ['--primary' as any]: primary,
    ['--heading-color' as any]: headingColor,
    ['--text-color' as any]: textColor,
    ['--secondary' as any]: secondary,
    // type
    ['--font-family' as any]: fontFamily,
    ['--font-size' as any]: `${fontSize}px`,
    ['--line-height' as any]: String(lineHeight),
    ['--letter-spacing' as any]: `${letterSpacing}px`,
  };

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
        className="no-print-shadow bg-white text-black shadow-2xl print:shadow-none"
        style={{ width: `${A4_MM_WIDTH}mm`, height: `${A4_MM_HEIGHT}mm`, ...cssVars, fontFamily: 'var(--font-family)' }}
      >
        <div className="h-full grid grid-cols-12">
          <aside className="col-span-4 bg-black text-white h-full flex flex-col">
            <div className="px-7 pt-10 pb-8 flex flex-col items-center">
              {person?.imageUrl && (
                <img
                  src={person.imageUrl}
                  alt={name}
                  className="w-28 h-28 object-cover rounded-full border-4 border-white mb-5"
                />
              )}
              <h1 className="text-2xl font-semibold leading-tight tracking-wide text-center">
                {name}
              </h1>
              {title ? (
                <p className="mt-1 text-sm uppercase tracking-wider opacity-90 text-center">
                  {title}
                </p>
              ) : null}
            </div>

            <div className="px-7">
              <div className="h-px bg-white/20" />
            </div>

            {visible.has('basics') && (contact.email || contact.phone || contact.location || contact.website || contact.linkedin || contact.github) && (
              <section className="px-7 pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest opacity-80">Contact</h2>
                <ul className="mt-3 space-y-2 text-[11px] leading-relaxed">
                  {contact.email && (<li className="break-words">{contact.email}</li>)}
                  {contact.phone && (<li className="break-words">{contact.phone}</li>)}
                  {contact.location && (<li className="break-words">{contact.location}</li>)}
                  {contact.website && (<li className="break-words">{String(contact.website)}</li>)}
                  {contact.linkedin && (<li className="break-words">linkedin.com/{String(contact.linkedin).replace(/^https?:\/\//, '')}</li>)}
                  {contact.github && (<li className="break-words">github.com/{String(contact.github).replace(/^https?:\/\//, '')}</li>)}
                </ul>
              </section>
            )}

            {visible.has('skills') && Array.isArray(skills) && skills.length > 0 && (
              <section className="px-7 pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest opacity-80">Skills</h2>
                <ul className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {skills.map((s: any, i: number) => (
                    <li key={i} className="border border-white/25 rounded px-2 py-1 leading-none">
                      {typeof s === 'string' ? s : (s?.name || s?.label || '')}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {visible.has('languages') && Array.isArray(languages) && languages.length > 0 && (
              <section className="px-7 pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-widest opacity-80">Languages</h2>
                <ul className="mt-3 space-y-1 text-[11px]">
                  {languages.map((l: any, i: number) => {
                    const nm = typeof l === 'string' ? l : (l?.name || l?.language || '');
                    const lvl = typeof l === 'string' ? '' : (l?.level || l?.fluency || '');
                    return (
                      <li key={i}>{[nm, lvl].filter(Boolean).join(' — ')}</li>
                    );
                  })}
                </ul>
              </section>
            )}

            <div className="mt-auto px-7 pb-8">
              <div className="h-px bg-white/20" />
              <p className="mt-3 text-[10px] opacity-70 leading-relaxed">References available upon request.</p>
            </div>
          </aside>

          <main className="col-span-8 h-full flex flex-col">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleRightDragEnd}>
              <SortableContext items={rightOrder} strategy={verticalListSortingStrategy}>
                {rightOrder.map((key, idx) => (
                  <SortableSection key={key} id={key} index={idx}>
                    {renderRightSection(key)}
                  </SortableSection>
                ))}
              </SortableContext>
            </DndContext>
            <div className="mt-auto pb-4" />
          </main>
        </div>
      </article>
    </div>
  );
};

function Header({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-black/80">{label}</h3>
      <div className="flex-1 h-px bg-black/10" />
    </div>
  );
}

type ResumeItem = { title?: string; subtitle?: string; location?: string; date?: string; bullets?: string[] };
function Item({ title, subtitle, location, date, bullets }: ResumeItem) {
  return (
    <div className="grid grid-cols-12 gap-1">
      <div className="col-span-9">
        <h4 className="text-[13px] font-semibold leading-tight">{title}</h4>
        {(subtitle || location) && (
          <p className="text-[11px] opacity-80">{[subtitle, location].filter(Boolean).join(' · ')}</p>
        )}
        {Array.isArray(bullets) && bullets.length > 0 && (
          <ul className="mt-2 list-disc pl-4 text-[12px] space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="leading-relaxed">{b}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="col-span-3 text-right">
        {date && <p className="text-[11px] opacity-70">{date}</p>}
      </div>
    </div>
  );
}

export default CanvaBWClean;
