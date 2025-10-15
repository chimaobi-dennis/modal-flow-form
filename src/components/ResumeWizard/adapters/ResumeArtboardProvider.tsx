import React, { createContext, useContext, useMemo } from "react";

// Minimal types to satisfy the existing templates
export type URLType = { href: string; label?: string };

export type Basics = {
  name: string;
  headline?: string;
  email?: string;
  phone?: string;
  location?: string;
  url: URLType;
  picture?: string;
  customFields: Array<{ id: string; icon?: string; name?: string; value: string }>;
};

export type SectionBase = {
  id: string;
  name: string;
  columns: number;
  visible: boolean;
  separateLinks?: boolean;
};

export type SummarySection = SectionBase & { content: string };

export type ItemBase = { id: string; visible: boolean };

export type ExperienceItem = ItemBase & {
  company: string;
  position?: string;
  location?: string;
  date?: string;
  summary?: string;
  url?: URLType;
};

export type EducationItem = ItemBase & {
  institution: string;
  area?: string; // field
  score?: string; // gpa
  studyType?: string; // degree
  date?: string; // start - end
  url?: URLType;
  summary?: string;
};

export type AwardItem = ItemBase & {
  title: string;
  awarder?: string;
  date?: string;
  url?: URLType;
  summary?: string;
};

export type CertificationItem = ItemBase & {
  name: string;
  issuer?: string;
  date?: string;
  url?: URLType;
  summary?: string;
};

export type SkillItem = ItemBase & {
  name: string;
  description?: string;
  level?: number; // 0-5
  keywords?: string[];
};

export type InterestItem = ItemBase & {
  name: string;
  keywords?: string[];
};

export type PublicationItem = ItemBase & {
  name: string;
  publisher?: string;
  date?: string;
  url?: URLType;
  summary?: string;
};

export type VolunteerItem = ItemBase & {
  organization: string;
  position?: string;
  location?: string;
  date?: string;
  url?: URLType;
  summary?: string;
};

export type LanguageItem = ItemBase & {
  name: string;
  description?: string;
  level?: number;
};

export type ProjectItem = ItemBase & {
  name: string;
  date?: string;
  url?: URLType;
  description?: string;
  summary?: string;
  keywords?: string[];
};

export type ReferenceItem = ItemBase & {
  name: string;
  description?: string;
  url?: URLType;
  summary?: string;
};

export type CustomItem = ItemBase & {
  name: string;
  description?: string;
  date?: string;
  location?: string;
  url?: URLType;
  summary?: string;
  keywords?: string[];
};

export type SectionWithItem<T> = SectionBase & {
  items: T[];
};

export type Sections = {
  profiles: SectionWithItem<{ id: string; visible: boolean; username: string; network?: string; icon?: string; url: URLType }>;
  summary: SummarySection;
  experience: SectionWithItem<ExperienceItem>;
  education: SectionWithItem<EducationItem>;
  awards: SectionWithItem<AwardItem>;
  certifications: SectionWithItem<CertificationItem>;
  skills: SectionWithItem<SkillItem>;
  interests: SectionWithItem<InterestItem>;
  publications: SectionWithItem<PublicationItem>;
  volunteer: SectionWithItem<VolunteerItem>;
  languages: SectionWithItem<LanguageItem>;
  projects: SectionWithItem<ProjectItem>;
  references: SectionWithItem<ReferenceItem>;
  custom: Record<string, SectionWithItem<CustomItem>>;
};

export type ResumeStore = {
  resume: {
    basics: Basics;
    sections: Sections;
  };
};

// Context and hook shim to match useArtboardStore signature
const ArtboardContext = createContext<ResumeStore | null>(null);

export const useArtboardStore = <T,>(selector: (state: ResumeStore) => T): T => {
  const ctx = useContext(ArtboardContext);
  if (!ctx) throw new Error("useArtboardStore must be used within ResumeArtboardProvider");
  return selector(ctx);
};

export type ApiResume = {
  content: {
    basics: {
      fullName: string;
      headline?: string;
      email?: string;
      phone?: string;
      website?: string;
      location?: string;
      picture?: string;
    };
    summary?: string;
    profile?: any[];
    experience?: Array<{
      company: string;
      position?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
      location?: string;
      current?: boolean;
      present?: boolean;
      descriptions?: string[];
    }>;
    education?: Array<{
      institution: string;
      degree?: string;
      field?: string;
      startDate?: string;
      endDate?: string;
      gpa?: string;
    }>;
    skills?: Array<{ name: string; level?: string }>;
    softSkills?: any[];
    languages?: any[];
    awards?: any[];
    certifications?: any[];
    interests?: any[];
    projects?: any[];
    publications?: any[];
    volunteering?: any[];
    custom?: any[];
    theme?: { primary?: string };
    typography?: { fontFamily?: string };
    pageSettings?: any;
  };
};

// Helper to coerce level strings to 0-5
const levelToNumber = (level?: string): number => {
  if (!level) return 0;
  const map: Record<string, number> = {
    beginner: 1,
    junior: 2,
    intermediate: 3,
    advanced: 4,
    expert: 5,
  };
  const key = level.toLowerCase();
  return map[key] ?? Number(level) ?? 0;
};

let autoId = 0;
const nextId = () => `${++autoId}`;

export const ResumeArtboardProvider: React.FC<{ apiResume: ApiResume; children: React.ReactNode }> = ({ apiResume, children }) => {
  const value = useMemo<ResumeStore>(() => {
    const c = apiResume?.content ?? ({} as ApiResume["content"]);

    const basics: Basics = {
      name: c.basics?.fullName ?? "",
      headline: c.basics?.headline ?? "",
      email: c.basics?.email ?? "",
      phone: c.basics?.phone ?? "",
      location: c.basics?.location ?? "",
      url: { href: c.basics?.website || "", label: c.basics?.website || "" },
      picture: c.basics?.picture || "",
      customFields: [],
    };

    const makeSection = <T,>(name: string, items: T[], opts?: Partial<SectionWithItem<T>>): SectionWithItem<T> => ({
      id: name,
      name,
      columns: (opts?.columns as number) ?? 1,
      visible: (opts?.visible as boolean) ?? items.length > 0,
      separateLinks: opts?.separateLinks ?? false,
      items,
    });

    const summary: SummarySection = {
      id: "summary",
      name: "Summary",
      columns: 1,
      visible: !!c.summary,
      content: c.summary || "",
    };

    const experience = makeSection<ExperienceItem>(
      "Experience",
      (c.experience || []).filter(Boolean).map((e) => ({
        id: nextId(),
        visible: true,
        company: e.company,
        position: e.position,
        location: e.location,
        date: [e.startDate, e.endDate && e.endDate !== "Present" ? e.endDate : e.present ? "Present" : ""].filter(Boolean).join(" - "),
        summary: e.description || (e.descriptions && e.descriptions.length ? `<ul>${e.descriptions.map((d)=>`<li>${d}</li>`).join("")}</ul>` : ""),
      })),
      { columns: 1, visible: true }
    );

    const education = makeSection<EducationItem>(
      "Education",
      (c.education || []).filter(Boolean).map((e) => ({
        id: nextId(),
        visible: !!e.institution,
        institution: e.institution,
        area: e.field,
        score: e.gpa,
        studyType: e.degree,
        date: [e.startDate, e.endDate].filter(Boolean).join(" - "),
      })),
      { columns: 1 }
    );

    const skills = makeSection<SkillItem>(
      "Skills",
      (c.skills || []).filter((s) => s?.name).map((s) => ({ id: nextId(), visible: true, name: s.name, level: levelToNumber(s.level) }))
    );

    const empty = <T,>() => makeSection<T>("", [], { visible: false });

    const sections: Sections = {
      profiles: empty(),
      summary,
      experience,
      education,
      awards: empty(),
      certifications: empty(),
      skills,
      interests: empty(),
      publications: empty(),
      volunteer: empty(),
      languages: empty(),
      projects: empty(),
      references: empty(),
      custom: {},
    } as unknown as Sections;

    return { resume: { basics, sections } };
  }, [apiResume]);

  return <ArtboardContext.Provider value={value}>{children}</ArtboardContext.Provider>;
};
