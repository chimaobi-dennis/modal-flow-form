import React from 'react';

interface BlackWhiteCleanProps {
  resumeData: any;
}

// Black & White Clean Professional A4 Resume
// Implements the user's provided design specs with scoped CSS.
export const BlackWhiteClean: React.FC<BlackWhiteCleanProps> = ({ resumeData }) => {
  const pi = (resumeData?.basics || resumeData?.content?.basics || {}) as any;
  const summaryText = (resumeData?.summary ?? resumeData?.content?.summary ?? '') as string;
  const experiences = Array.isArray(resumeData?.experience)
    ? resumeData.experience
    : (Array.isArray(resumeData?.content?.experience) ? resumeData.content.experience : []);
  const educations = Array.isArray(resumeData?.education)
    ? resumeData.education
    : (Array.isArray(resumeData?.content?.education) ? resumeData.content.education : []);
  // Support both wizard-normalized array and legacy object { technicalSkills: [] }
  const skillsArray = Array.isArray(resumeData?.skills)
    ? (resumeData.skills as any[])
    : (Array.isArray(resumeData?.content?.skills)
        ? (resumeData.content.skills as any[])
        : (Array.isArray(resumeData?.skills?.technicalSkills) ? resumeData.skills.technicalSkills : []));

  const fullName = [pi.firstName, pi.lastName].filter(Boolean).join(' ') || 'YOUR NAME';
  const professionalTitle = pi.professionalTitle || pi.title || '';

  // Read theme/typography from API (supports both flat and content.* nesting)
  const theme = (resumeData?.theme || resumeData?.content?.theme || {}) as Record<string, any>;
  const typo = (resumeData?.typography || resumeData?.content?.typography || {}) as Record<string, any>;

  const primary = theme.primary || '#0ea5e9';
  const headingColor = theme.headingColor || '#1a1a1a';
  const textColor = theme.textColor || '#444444';

  const fontFamily = typo.fontFamily || 'Roboto, Inter, Segoe UI, Helvetica Neue, Arial, sans-serif';
  const fontSize = (typo.fontSize ?? 11); // base px
  const lineHeight = (typo.lineHeight ?? 1.3);
  const letterSpacing = (typo.letterSpacing ?? 0);

  const splitLines = (text?: string, max?: number) =>
    String(text || '')
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, max || 12);

  return (
    <div
      className="bw-clean"
      style={{
        fontFamily,
        fontSize: `${fontSize}px`,
        lineHeight,
        letterSpacing: `${letterSpacing}px`,
        // Map API colors to CSS variables used by the template
        ['--primary' as any]: primary,
        ['--heading-color' as any]: headingColor,
        ['--text-color' as any]: textColor,
        ['--color-dark-gray' as any]: headingColor,
        ['--color-medium-gray' as any]: headingColor,
        ['--color-text-gray' as any]: textColor,
      }}
    >
      <style>{`
        /* Reset */
        .bw-clean * { box-sizing: border-box; }

        /* Variables scoped to .bw-clean root */
        .bw-clean {
          --color-black: #000000;
          --color-dark-gray: var(--color-dark-gray, #1a1a1a);
          --color-medium-gray: var(--color-medium-gray, #333333);
          --color-text-gray: var(--text-color, #444444);
          --color-light-gray: #666666;
          --color-border-gray: #cccccc;
          --color-bg-gray: #f8f8f8;
          --color-white: #ffffff;
          --color-accent-line: #e0e0e0;

          --font-name: 28px;
          --font-subtitle: 16px;
          --font-section: 14px;
          --font-job-title: 13px;
          --font-company: 12px;
          --font-body: ${fontSize}px;
          --font-small: 10px;

          --space-xs: 3px;
          --space-sm: 6px;
          --space-md: 12px;
          --space-lg: 18px;
          --space-xl: 24px;
          --space-2xl: 36px;

          --letter-spacing-tight: -0.015em;
          --letter-spacing-normal: 0;
          --letter-spacing-wide: 0.03em;

          --line-height-tight: 1.1;
          --line-height-normal: 1.3;
          --line-height-relaxed: 1.4;
        }

        .bw-clean .resume-container {
          width: 100%;
          height: 100%;
          background: var(--color-white);
          margin: 0 auto;
          /* Approx mm -> px for consistent preview sizing */
          padding: 76px 68px 57px 68px;
          box-shadow: 0 0 20px rgba(0,0,0,0.08);
          position: relative;
          font-family: 'Roboto','Inter','Segoe UI','Helvetica Neue',sans-serif;
          line-height: var(--line-height-normal);
          color: var(--color-text-gray);
        }

        .bw-clean .resume-header {
          text-align: center;
          border-bottom: 2px solid var(--color-dark-gray);
          padding-bottom: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        .bw-clean .name {
          font-size: var(--font-name);
          font-weight: 700;
          color: var(--heading-color, var(--color-black));
          letter-spacing: var(--letter-spacing-tight);
          margin-bottom: var(--space-sm);
          text-transform: uppercase;
          line-height: var(--line-height-tight);
        }

        .bw-clean .professional-title {
          font-size: var(--font-subtitle);
          font-weight: 400;
          color: var(--heading-color, var(--color-medium-gray));
          margin-bottom: var(--space-md);
        }

        .bw-clean .contact-info {
          display: flex;
          justify-content: center;
          gap: var(--space-lg);
          font-size: var(--font-small);
          color: var(--color-light-gray);
          flex-wrap: wrap;
        }

        .bw-clean .section-header {
          font-size: var(--font-section);
          font-weight: 600;
          color: var(--heading-color, var(--color-dark-gray));
          text-transform: uppercase;
          letter-spacing: var(--letter-spacing-wide);
          border-bottom: 1px solid var(--color-border-gray);
          padding-bottom: var(--space-sm);
          margin: var(--space-xl) 0 var(--space-lg) 0;
        }

        .bw-clean .summary {
          background-color: var(--color-bg-gray);
          padding: var(--space-lg);
          margin: var(--space-xl) 0;
          border-left: 4px solid var(--color-dark-gray);
        }
        .bw-clean .summary-text {
          font-size: var(--font-body);
          color: var(--text-color, var(--color-text-gray));
          line-height: var(--line-height-relaxed);
          font-style: italic;
        }

        .bw-clean .job-entry { margin-bottom: var(--space-lg); }
        .bw-clean .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-sm);
          gap: var(--space-md);
        }
        .bw-clean .job-title {
          font-size: var(--font-job-title);
          font-weight: 600;
          color: var(--heading-color, var(--color-medium-gray));
          line-height: var(--line-height-tight);
        }
        .bw-clean .company-name {
          font-size: var(--font-company);
          font-weight: 500;
          color: var(--text-color, var(--color-text-gray));
          margin-top: var(--space-xs);
        }
        .bw-clean .job-dates {
          font-size: var(--font-small);
          font-weight: 300;
          color: var(--color-light-gray);
          text-align: right;
          line-height: var(--line-height-tight);
          white-space: nowrap;
        }
        .bw-clean .location {
          font-size: var(--font-small);
          color: var(--color-light-gray);
          font-style: italic;
        }

        .bw-clean .description-list { margin: var(--space-sm) 0 0 var(--space-md); }
        .bw-clean .description-item {
          font-size: var(--font-body);
          color: var(--text-color, var(--color-text-gray));
          line-height: var(--line-height-normal);
          margin-bottom: var(--space-xs);
          position: relative;
          padding-left: var(--space-md);
        }
        .bw-clean .description-item::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--color-medium-gray);
          font-weight: bold;
        }

        .bw-clean .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--space-md);
          margin-top: var(--space-md);
        }
        .bw-clean .skill-category {
          border-left: 3px solid var(--color-border-gray);
          padding-left: var(--space-md);
        }
        .bw-clean .skill-category-title {
          font-size: var(--font-company);
          font-weight: 600;
          color: var(--heading-color, var(--color-medium-gray));
          margin-bottom: var(--space-xs);
        }
        .bw-clean .skill-list {
          font-size: var(--font-small);
          color: var(--text-color, var(--color-text-gray));
          line-height: var(--line-height-relaxed);
        }

        .bw-clean .education-entry { margin-bottom: var(--space-md); }
        .bw-clean .degree {
          font-size: var(--font-company);
          font-weight: 600;
          color: var(--color-medium-gray);
        }
        .bw-clean .university {
          font-size: var(--font-small);
          color: var(--color-text-gray);
          margin-top: var(--space-xs);
        }
        .bw-clean .graduation-date {
          font-size: var(--font-small);
          color: var(--color-light-gray);
          float: right;
        }

        .bw-clean .section-divider {
          height: 1px;
          background-color: var(--color-border-gray);
          margin: var(--space-xl) 0;
        }
        .bw-clean .subtle-divider {
          height: 1px;
          background-color: var(--color-accent-line);
          margin: var(--space-lg) 0;
        }

        @media print {
          .bw-clean {
            --font-name: 26px;
            --font-subtitle: 15px;
            --font-section: 13px;
            --font-body: 10px;
          }
          .bw-clean .resume-container { box-shadow: none !important; }
          .bw-clean .resume { background: white !important; color: black !important; }
          .bw-clean .page-break { page-break-before: always; }
          .bw-clean .no-page-break { page-break-inside: avoid; }
          .bw-clean * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        }

        @media (prefers-contrast: high) {
          .bw-clean {
            --color-dark-gray: #000000;
            --color-medium-gray: #000000;
            --color-text-gray: #000000;
            --color-border-gray: #000000;
          }
          .bw-clean .degree {
          font-size: var(--font-company);
          font-weight: 600;
          color: var(--heading-color, var(--color-medium-gray));
        }
        .bw-clean .university {
          font-size: var(--font-small);
          color: var(--text-color, var(--color-text-gray));
          margin-top: var(--space-xs);
        }
      `}</style>

      <div className="resume-container">
        {/* Header */}
        <header className="resume-header">
          <h1 className="name">{(pi.fullName || fullName).toUpperCase()}</h1>
          {(pi.headline || professionalTitle) && (
            <h2 className="professional-title">{pi.headline || professionalTitle}</h2>
          )}
          <div className="contact-info">
            {pi.email && <span>{pi.email}</span>}
            {(pi.email && (pi.phone || pi.location || pi.website)) && <span>•</span>}
            {pi.phone && <span>{pi.phone}</span>}
            {(pi.phone && (pi.location || pi.website)) && <span>•</span>}
            {pi.website && <span style={{ color: 'var(--primary)' }}>{pi.website}</span>}
            {(pi.website && pi.location) && <span>•</span>}
            {pi.location && <span>{pi.location}</span>}
          </div>
        </header>

        {/* Summary */}
        {summaryText && (
          <section className="summary">
            <p className="summary-text">{summaryText}   </p>
          </section>
        )}

        {/* Experience */}
        <section>
          <h2 className="section-header">Professional Experience</h2>
          {experiences.length === 0 && (
            <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-light-gray)' }}>
              Add your professional experience.
            </div>
          )}
          {experiences.map((exp: any, idx: number) => (
            <div key={idx} className="job-entry">
              <div className="job-header">
                <div>
                  <div className="job-title">{exp.jobTitle || 'Job Title'}</div>
                  <div className="company-name">{exp.company || 'Company'}{exp.location ? '' : ''}</div>
                  {exp.location && <div className="location">{exp.location}</div>}
                </div>
                <div className="job-dates">
                  {[exp.startDate, (exp.isCurrentRole || exp.current || exp.present) ? 'Present' : exp.endDate]
                    .filter(Boolean)
                    .join(' - ')}
                </div>
              </div>
              {Array.isArray(exp.descriptions) && exp.descriptions.length > 0 ? (
                <ul className="description-list">
                  {exp.descriptions.map((desc: string, li: number) => (
                    <li key={li} className="description-item">{desc}</li>
                  ))}
                </ul>
              ) : (
                exp.description ? (
                  <ul className="description-list">
                    {splitLines(exp.description, 8).map((line, li) => (
                      <li key={li} className="description-item">{line}</li>
                    ))}
                  </ul>
                ) : null
              )}
            </div>
          ))}
        </section>

        {/* Skills */}
        {skillsArray.length > 0 && (
          <section>
            <h2 className="section-header">Technical Skills</h2>
            <div className="skills-grid">
              <div>
                {/* Flat list when entries are strings */}
                <div className="skill-category-title">Technical</div>
                <div className="skill-list">
                  {skillsArray
                    .map((s: any) => (typeof s === 'string' ? s : (s?.name ?? s?.label ?? '')))
                    .filter(Boolean)
                    .join(', ')}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Education */}
        <section>
          <h2 className="section-header">Education</h2>
          {educations.length === 0 && (
            <div style={{ fontSize: 'var(--font-body)', color: 'var(--color-light-gray)' }}>
              Add your education.
            </div>
          )}
          {educations.map((edu: any, idx: number) => (
            <div key={idx} className="education-entry">
              <div className="degree">{edu.degree || 'Degree'}</div>
              {edu.endYear && <div className="graduation-date">{edu.endYear}</div>}
              <div className="university">{[edu.school, edu.location].filter(Boolean).join(', ')}</div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
