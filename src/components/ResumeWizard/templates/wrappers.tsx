import React from "react";
import type { TemplateComponent } from "../TemplateRegistry";
import { ResumeArtboardProvider, type ApiResume } from "../adapters/ResumeArtboardProvider";


// Default section layout for 2-column templates
const defaultMain: string[] = [
  "summary",
  "experience",
  "education",
  "projects",
  "publications",
];
const defaultSidebar: string[] = [
  "skills",
  "languages",
  "awards",
  "certifications",
  "interests",
  "references",
];

const ensureApiResume = (data: any): ApiResume => {
  // If the caller passes {content: {...}}, keep it; otherwise wrap in {content}
  if (data && typeof data === "object" && "content" in data) return data as ApiResume;
  return { content: (data as any) ?? {} } as ApiResume;
};

// Page sizing is handled centrally by TemplateRenderer via TemplateCanvas.

function WrapperStyles({ primary }: { primary: string }) {
  // Map tailwind-like utility classes used in templates to a configurable color via CSS var
  const css = `
  .text-primary { color: var(--primary) !important; }
  .bg-primary { background-color: var(--primary) !important; }
  .border-primary { border-color: var(--primary) !important; }
  `;
  return (
    <style>{css}</style>
  );
}

export const AzurillTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9"; // sky-500 fallback
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          // Typography
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          // Color variable host
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Azurill - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const BronzorTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Bronzor - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const ChikoritaTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Chikorita - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const DittoTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Ditto - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const GengarTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Gengar - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const GlalieTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Glalie - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const KakunaTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Kakuna - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const LeafishTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Leafish - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};
  
export const NosepassTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Nosepass - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const OnyxTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Onyx - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const PikachuTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Pikachu - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};

export const RhyhornTemplate: TemplateComponent = ({ resumeData }) => {
  const apiResume = ensureApiResume(resumeData);
  const primary = apiResume.content?.theme?.primary || "#0ea5e9";
  const typo: any = apiResume.content?.typography || {};
  return (
    <ResumeArtboardProvider apiResume={apiResume}>
      <div
        style={{
          fontFamily: typo.fontFamily || "Inter, ui-sans-serif, system-ui, sans-serif",
          fontSize: (typo.fontSize ?? 14) + "px",
          lineHeight: typo.lineHeight ?? 1.5,
          letterSpacing: (typo.letterSpacing ?? 0) + "px",
          ["--primary" as any]: primary,
        }}
      >
        <WrapperStyles primary={primary} />
        <div>Template Rhyhorn - Component not yet imported</div>
      </div>
    </ResumeArtboardProvider>
  );
};