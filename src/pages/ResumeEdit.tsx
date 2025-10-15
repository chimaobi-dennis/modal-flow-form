import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ResumeBuilder } from '@/components/ResumeWizard/ResumeBuilder/ResumeBuilder';
import DocumentApi from '@/lib/documentApi';

export const ResumeEdit: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [initialData, setInitialData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [documentId, setDocumentId] = useState<number | null>(null);

  // Load existing document if ID is provided
  useEffect(() => {
    const loadDocument = async () => {
      // Try multiple common keys for document ID
      const queryId =
        searchParams.get('id') ??
        searchParams.get('ID') ??
        searchParams.get('docId') ??
        searchParams.get('documentId') ??
        searchParams.get('document_id');
      
      const docId = queryId ?? id ?? '';
      
      if (!docId) {
        console.debug('ResumeEdit: No document ID found in URL');
        return;
      }

      setLoading(true);
      try {
        const document = await DocumentApi.getDocument(parseInt(docId));
        setDocumentId(parseInt(docId));

        // Parse the document content
        let content = (document as any)?.content;
        if (typeof content === 'string') {
          try {
            content = JSON.parse(content);
          } catch (e) {
            console.error('Failed to parse document content:', e);
          }
        }
        // If unified payload, unwrap to resumeData
        const maybeInner = content && typeof content === 'object' && 'content' in content
          ? (content as any).content
          : content;

        // Normalize legacy snapshot (wizard raw) -> unified resumeData
        const normalize = (data: any) => {
          if (!data || typeof data !== 'object') return data;
          if (data.basics) return data; // already unified
          const p = data.personalInfo || {};
          const experiences = Array.isArray(data.experiences) ? data.experiences : [];
          const educations = Array.isArray(data.educations) ? data.educations : [];
          const skillsBlock = data.skills || { technicalSkills: [], softSkills: [], languages: [], certifications: [] };
          return {
            basics: {
              fullName: [p.firstName, p.lastName].filter(Boolean).join(' ').trim(),
              headline: String(p.headline || ''),
              email: String(p.email || ''),
              phone: String(p.phone || ''),
              website: String(p.website || ''),
              location: String(p.location || ''),
              picture: String(p.picture || '')
            },
            summary: String(p.summary || ''),
            profile: {},
            experience: experiences.map((e: any) => ({
              id: e.id,
              jobTitle: e.jobTitle,
              company: e.company,
              location: e.location,
              startDate: e.startDate,
              endDate: e.endDate,
              isCurrentRole: e.isCurrentRole,
              description: e.description,
              achievements: Array.isArray(e.achievements) ? e.achievements : []
            })),
            education: educations.map((ed: any) => ({
              id: ed.id,
              degree: ed.degree,
              major: ed.major,
              institution: ed.institution,
              location: ed.location,
              graduationDate: ed.graduationDate,
              gpa: ed.gpa,
              relevantCoursework: Array.isArray(ed.relevantCoursework) ? ed.relevantCoursework : [],
              achievements: Array.isArray(ed.achievements) ? ed.achievements : []
            })),
            skills: (skillsBlock.technicalSkills || []).map((s: any) => ({ name: String(s.name), level: s.level })),
            softSkills: (skillsBlock.softSkills || []).map((s: any) => String(s)),
            languages: (skillsBlock.languages || []).map((l: any) => ({ name: String(l.name), level: l.level })),
            awards: [],
            certifications: (skillsBlock.certifications || []).map((c: any) => String(c)),
            interests: [],
            projects: Array.isArray((data as any).projects) ? (data as any).projects : [],
            publications: Array.isArray((data as any).publications) ? (data as any).publications : [],
            volunteering: Array.isArray((data as any).volunteering) ? (data as any).volunteering : [],
            custom: []
          };
        };

        // Carry over template_id so the editor can resolve and load the correct template on first render
        const initial = normalize(maybeInner);
        const tplId = (document as any)?.template_id ?? (document as any)?.template?.id ?? null;
        const tplObj = (document as any)?.template || null;
        const initialWithTemplate = tplId
          ? {
              ...initial,
              template_id: Number(tplId),
              template: tplObj
                ? { id: Number(tplObj.id), slug: String(tplObj.slug || ''), name: String(tplObj.name || '') }
                : undefined,
            }
          : initial;
        setInitialData(initialWithTemplate);
      } catch (error) {
        console.error('Failed to load document:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id, searchParams]);

  // Handle saving the document
  const handleSave = async (data: any) => {
    try {
      // Build unified payload compatible with backend and editor
      const title = data?.basics?.fullName ? `${data.basics.fullName} - CV` : 'Untitled CV';
      const content = {
        theme: undefined,
        typography: undefined,
        pageSettings: undefined,
        content: { ...data }
      } as any;

      // Fallback user_id for unauthenticated API
      const root = document.getElementById('root');
      const uidAttr = root?.getAttribute('data-user-id') || document.body.getAttribute('data-user-id');
      const user_id = uidAttr ? parseInt(uidAttr, 10) : undefined;

      if (documentId) {
        await DocumentApi.updateDocument(documentId, {
          title,
          content,
          category: 'cv',
          type: 'document',
          status: 'draft',
          ...(Number.isFinite(user_id as any) ? { user_id } : {})
        } as any);
        console.log('Document updated successfully');
      } else {
        const created = await DocumentApi.saveDocument({
          title,
          category: 'cv',
          type: 'document',
          content,
          language: 'en',
          ...(Number.isFinite(user_id as any) ? { user_id } : {})
        } as any);
        if ((created as any)?.id) {
          setDocumentId((created as any).id as number);
          console.log('Document created successfully');
        }
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <ResumeBuilder
      initialData={initialData}
      onSave={handleSave}
      documentId={documentId ?? undefined}
    />
  );
};
