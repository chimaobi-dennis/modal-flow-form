import React from 'react';

interface ModernProfessionalProps {
  resumeData: any;
}

// Pixel-friendly, print-friendly canvas. Uses Tailwind classes but keeps
// a deterministic structure for future print/React-PDF parity.
export const ModernProfessional: React.FC<ModernProfessionalProps> = ({ resumeData }) => {
  const pi = resumeData?.basics || {};
  const experiences = Array.isArray(resumeData?.experience) ? resumeData.experience : [];
  const summary = resumeData?.summary || '';
  const educations = Array.isArray(resumeData?.education) ? resumeData.education : [];
  // Support both wizard-normalized array and legacy object { technicalSkills: [] }
  const skillsArray = Array.isArray(resumeData?.skills)
    ? (resumeData.skills as any[])
    : (Array.isArray(resumeData?.skills?.technicalSkills) ? resumeData.skills.technicalSkills : []);

  // Read theme/typography from API (supports either flat or content.* nesting)
  const theme = (resumeData?.theme || resumeData?.content?.theme || {}) as Record<string, any>;
  const typo = (resumeData?.typography || resumeData?.content?.typography || {}) as Record<string, any>;

  const primary = theme.primary || '#0ea5e9';
  const accent = theme.accent || '#0f172a';
  const secondary = theme.secondary || '#334155';
  const textColor = theme.text || '#334155';

  const fontFamily = typo.fontFamily || 'Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
  const fontSize = (typo.fontSize ?? 11); // base px
  const lineHeight = (typo.lineHeight ?? 1.4);
  const letterSpacing = (typo.letterSpacing ?? 0);

  // Helpers: format dates like "june, 2025" and handle Present flags
  const toMonthYear = (v: any): string | undefined => {
    if (!v) return undefined;
    const s = String(v).trim();
    if (!s) return undefined;
    if (/^present$/i.test(s)) return 'Present';
    // If it's just a year like '2019'
    if (/^\d{4}$/.test(s)) return s;
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const month = d.toLocaleString('en-US', { month: 'long' });
      const year = d.getFullYear();
      return `${month}, ${year}`;
    }
    // Fallback: return as-is
    return s;
  };

  const formatDateRange = (start?: any, end?: any, flags?: any): string => {
    const isPresent = !!(flags?.isCurrentRole || flags?.current || flags?.present);
    const a = toMonthYear(start);
    const b = isPresent ? 'Present' : toMonthYear(end);
    return [a, b].filter(Boolean).join(' – ');
  };

  return (
    <div
      className="w-full h-full bg-white overflow-hidden print:shadow-none"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        letterSpacing: `${letterSpacing}px`,
        color: textColor,
        // expose a few variables if needed down the tree
        ['--primary' as any]: primary,
        ['--heading-color' as any]: secondary,
        ['--text-color' as any]: textColor,
      }}
    >
      {/* Page margins */}
      <div className="p-8" style={{ color: 'var(--text-color)' }}>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--primary)' }}>
            {(pi.fullName || 'Your Name')}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1" style={{ color: 'var(--primary)' }}>
            {pi.email && <span>{pi.email}</span>}
            {pi.phone && <span>{pi.phone}</span>}
            {pi.location && <span>{pi.location}</span>}
            {pi.website && <span style={{ color: 'var(--primary)' }}>{pi.website}</span>}
          </div>
        </div>

        {/* Grid: left sidebar + main */}
        <div className="mt-6 grid grid-cols-12 gap-6">
          {/* Sidebar (Left ~ 4/12) */}
          <aside className="col-span-12 md:col-span-4 space-y-6">
            {/* Summary */}
            {summary && (
              <section>
                <h2
                  className="text-[12px] font-semibold uppercase tracking-[0.08em] border-b pb-1"
                  style={{ color: 'var(--heading-color)', borderColor: '#e2e8f0' }}
                >
                  Summary
                </h2>
                <p className="mt-2 text-[11px] leading-snug text-slate-700 line-clamp-10">
                  {summary}
                </p>
              </section>
            )}

            {/* Skills */}
            {skillsArray.length > 0 && (
              <section>
                <h2
                  className="text-[12px] font-semibold uppercase tracking-[0.08em] border-b pb-1"
                  style={{ color: 'var(--heading-color)', borderColor: '#e2e8f0' }}
                >
                  Skills
                </h2>
                <div className="mt-2 flex flex-wrap gap-1">
                  {skillsArray.slice(0, 24).map((s: any, idx: number) => {
                    const label = typeof s === 'string' ? s : (s?.name ?? s?.label ?? '');
                    return (
                      <span key={idx} className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: '#f1f5f9', color: 'var(--text-color)' }}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </aside>

          {/* Main (Right ~ 8/12) */}
          <main className="col-span-12 md:col-span-8 space-y-6">
            {/* Experience */}
            <section>
              <h2
                className="text-[12px] font-semibold uppercase tracking-[0.08em] border-b pb-1"
                style={{ color: 'var(--heading-color)', borderColor: '#e2e8f0' }}
              >
                Experience
              </h2>
              <div className="mt-2 space-y-3">
                {experiences.length > 0 ? (
                  experiences.map((exp: any, idx: number) => (
                    <div key={idx} className="">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium" style={{ color: 'var(--primary)' }}>{exp.position || 'Role'}</div>
                          <div className="text-[10px]" style={{ color: 'var(--text-color)' }}>{[exp.company, exp.location].filter(Boolean).join(' • ')}</div>
                        </div>
                        <div className="text-[10px] whitespace-nowrap" style={{ color: '#64748b' }}>
                          {formatDateRange(exp.startDate, exp.endDate, exp)}
                        </div>
                      </div>
                      {Array.isArray(exp.descriptions) && exp.descriptions.length > 0 ? (
                        <ul className="mt-1 list-disc ml-4 space-y-1">
                          {exp.descriptions.slice(0, 10).map((line: string, i: number) => (
                            <li key={i} className="text-[11px] leading-snug" style={{ color: 'var(--text-color)' }}>{line}</li>
                          ))}
                        </ul>
                      ) : (
                        exp.description ? (
                          <ul className="mt-1 list-disc ml-4 space-y-1">
                            {String(exp.description)
                              .split('\n')
                              .filter(Boolean)
                              .slice(0, 10)
                              .map((line, i) => (
                                <li key={i} className="text-[11px] leading-snug" style={{ color: 'var(--text-color)' }}>{line}</li>
                              ))}
                          </ul>
                        ) : null
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-[11px]" style={{ color: '#94a3b8' }}>Add your experience to showcase your impact.</div>
                )}
              </div>
            </section>

            {/* Education */}
            <section>
              <h2
                className="text-[12px] font-semibold uppercase tracking-[0.08em] border-b pb-1"
                style={{ color: 'var(--heading-color)', borderColor: '#e2e8f0' }}
              >
                Education
              </h2>
              <div className="mt-2 space-y-2">
                {educations.length > 0 ? (
                  educations.map((edu: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium" style={{ color: 'var(--heading-color)' }}>{edu.degree || 'Degree'}</div>
                          <div className="text-[10px]" style={{ color: 'var(--text-color)' }}>{edu.institution}</div>
                          {edu.fieldOfStudy && (
                            <div className="text-[10px]" style={{ color: '#64748b' }}>{edu.fieldOfStudy}</div>
                          )}
                        </div>
                        <div className="text-[10px] whitespace-nowrap" style={{ color: '#64748b' }}>
                          {[toMonthYear(edu.startDate), toMonthYear(edu.endDate)].filter(Boolean).join(' – ')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[11px]" style={{ color: '#94a3b8' }}>Add your education history.</div>
                )}
              </div>
            </section>
          </main>
        </div>

        {/* Footer note */}
        <div className="mt-6 text-center text-slate-400 text-[10px]">
          Template: {resumeData?.template?.name || 'Modern Professional'}
        </div>
      </div>
    </div>
  );
};
