import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { otherDocAI, getScopedDocumentQuestions, DEFAULT_MODEL, getTextSuggestions } from '@/services/aiService';
import { getAllPrograms, getPrograms, getUserApplications, getUserProfiles, getProgramsPrioritizedByApplications } from '@/services/profileService';
import { logAiGeneration } from '@/services/aiLogService';
import { queryAiMemory, storeAiMemory } from '@/services/memoryService';

interface QA {
  question: string;
  answer: string;
}

interface OtherDocQuestionsModalProps {
  open: boolean;
  documentTypeId: string; // e.g. 'sop'
  documentTypeLabel: string; // e.g. 'Statement of Purpose'
  userId?: string;
  tone?: string;
  wordCount?: string;
  additionalRequirements?: string;
  onBack: () => void; // closes modal
  onComplete: (payload: { content: string; qa: QA[] }) => void;
}

export const OtherDocQuestionsModal: React.FC<OtherDocQuestionsModalProps> = ({
  open,
  documentTypeId,
  documentTypeLabel,
  userId,
  tone,
  wordCount,
  additionalRequirements,
  onBack,
  onComplete,
}) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [qa, setQa] = useState<QA[]>([]);
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // Background stages
  const [stage, setStage] = useState<'profile' | 'program' | 'confirm' | 'qa'>('profile');
  const [profiles, setProfiles] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [customProgramLink, setCustomProgramLink] = useState<string>('');
  const [prefProgramIds, setPrefProgramIds] = useState<number[]>([]);
  const [programQuery, setProgramQuery] = useState<string>('');
  const [programOpen, setProgramOpen] = useState<boolean>(false);
  const programDropdownRef = useRef<HTMLDivElement | null>(null);
  const [allProgramsLoaded, setAllProgramsLoaded] = useState<boolean>(false);

  // Memoized preferred set and filtered programs for performance
  const preferredSet = useMemo(() => new Set(prefProgramIds), [prefProgramIds]);
  const filteredPrograms = useMemo(() => {
    const q = programQuery.trim().toLowerCase();
    const list = (programs || []).filter((p) => {
      if (!q) return true;
      const course = String((p as any).course_name || (p as any).name || '').toLowerCase();
      const uni = String((p as any).university_name || '').toLowerCase();
      return course.includes(q) || uni.includes(q);
    });
    return list.sort((a, b) => {
      const ai = preferredSet.has(a.id) ? 0 : 1;
      const bi = preferredSet.has(b.id) ? 0 : 1;
      if (ai !== bi) return ai - bi; // preferred first
      const an = String((a as any).course_name || (a as any).name || '');
      const bn = String((b as any).course_name || (b as any).name || '');
      return an.localeCompare(bn);
    });
  }, [programs, programQuery, preferredSet]);

  // Load profiles initially
  useEffect(() => {
    if (!open || !documentTypeId) return;
    let cancelled = false;
    const run = async () => {
      setStage('profile');
      setQuestions([]);
      setQa([]);
      setCurrent(0);
      setLoading(true);
      try {
        const profs = await getUserProfiles(userId || '');
        if (!cancelled) setProfiles(profs || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [open, documentTypeId, documentTypeLabel, userId]);

  // Close program dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!programOpen) return;
      const target = e.target as Node | null;
      if (programDropdownRef.current && target && !programDropdownRef.current.contains(target)) {
        setProgramOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [programOpen]);

  const total = stage === 'qa' ? (questions.length || 6) : 1;
  const currentAnswer = qa[current]?.answer || '';

  // AI autocomplete suggestions as user types
  useEffect(() => {
    if (!open) return;
    if (stage !== 'qa' || !questions[current]) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!typing) return;
    debounceRef.current = window.setTimeout(async () => {
      const context = `Question: ${questions[current]}\nDocument type: ${documentTypeLabel}`;
      const [{ completion }, suggResp] = await Promise.all([
        otherDocAI.getTextCompletion(currentAnswer, context),
        getTextSuggestions(currentAnswer, context),
      ]);
      setSuggestion(completion || '');
      setSuggestions(suggResp.suggestions || []);
      try { await logAiGeneration({ user_id: userId, model: DEFAULT_MODEL, prompt: context, response: JSON.stringify({ completion, suggestions: suggResp.suggestions || [] }), metadata: { type: 'auto_complete' } }); } catch {}
    }, 500);
    return () => { if (debounceRef.current) window.clearTimeout(debounceRef.current); };
  }, [currentAnswer, typing, current, questions, open, documentTypeLabel, stage, userId]);

  const setAnswer = (value: string) => {
    setQa(prev => {
      const next = [...prev];
      next[current] = { question: questions[current], answer: value };
      return next;
    });
  };

  const canNext = useMemo(() => (qa[current]?.answer || '').trim().length > 0, [qa, current]);

  const handleComplete = async () => {
    setGenerating(true);
    try {
      const { content, error } = await otherDocAI.generateDocumentFromQA({
        documentType: documentTypeLabel || documentTypeId,
        answers: qa.filter(Boolean),
        tone,
        wordCount: wordCount ? parseInt(wordCount) : undefined,
        templateName: undefined,
        additionalRequirements,
      });
      try { await logAiGeneration({ user_id: userId, model: DEFAULT_MODEL, prompt: `Generate ${documentTypeLabel}`, response: content || '', metadata: { type: 'document' } }); } catch {}
      if (error || !content) {
        console.error('Generate document failed', error);
        onComplete({ content: qa.map(q => `${q.question}\n\n${q.answer}`).join('\n\n'), qa });
      } else {
        onComplete({ content, qa });
      }
    } finally {
      setGenerating(false);
    }
  };

  // Stage transitions
  const handleProfileNext = () => {
    // Switch stage immediately for faster perceived performance
    setStage('program');
    setLoading(true);
    (async () => {
      try {
        if (userId) {
          const { programs: progsSorted, preferredIds } = await getProgramsPrioritizedByApplications(userId, selectedProfile ? { profileId: selectedProfile.id } : undefined);
          setPrograms(progsSorted || []);
          setPrefProgramIds(preferredIds || []);
        } else {
          const progs = await getPrograms();
          setPrograms(progs || []);
          setPrefProgramIds([]);
        }
        setAllProgramsLoaded(false);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleProgramNext = () => { setStage('confirm'); };

  const buildBackgroundContext = () => {
    const parts: string[] = [];
    parts.push(`Document type: ${documentTypeLabel}`);
    if (selectedProfile) {
      parts.push(`Profile: ${selectedProfile?.name || selectedProfile?.id}`);
      const fields = [
        ['Fields of Study', selectedProfile.fields_of_study],
        ['University', selectedProfile.university],
        ['Country', selectedProfile.university_country],
        ['Study Environment', selectedProfile.study_environment],
        ['Interests', selectedProfile.interest_keywords],
      ];
      fields.forEach(([k, v]) => {
        if (!v) return;
        const val = Array.isArray(v) ? v.join(', ') : String(v);
        parts.push(`${k}: ${val}`);
      });
    }
    if (selectedProgramId) {
      const prog = programs.find(p => p.id === selectedProgramId);
      if (prog) parts.push(`Program: ${prog.name} (id: ${prog.id})`);
    }
    if (customProgramLink) parts.push(`Custom Program Link: ${customProgramLink}`);
    if (additionalRequirements) parts.push(`Requirements: ${additionalRequirements}`);
    return parts.join('\n');
  };

  const handleConfirmNext = () => {
    // Move to QA immediately and show skeletons while we fetch questions
    setStage('qa');
    setLoading(true);
    (async () => {
      try {
        const context = buildBackgroundContext();
        // 1) Try memory first
        const mem = await queryAiMemory({
          document_type: documentTypeLabel || documentTypeId,
          context,
          profile_id: selectedProfile?.id || null,
          program_id: selectedProgramId || null,
        });
        if (mem.ok && Array.isArray(mem.questions) && mem.questions.length) {
          setQuestions(mem.questions);
        } else {
          // 2) Fallback to AI
          const { questions: qs, error } = await getScopedDocumentQuestions(documentTypeLabel || documentTypeId, context, 6);
          try { await logAiGeneration({ user_id: userId, model: DEFAULT_MODEL, prompt: `Questions for ${documentTypeLabel} with context`, response: JSON.stringify(qs || []), metadata: { type: 'question' } }); } catch {}
          let resolved = qs;
          if (error || !qs?.length) {
            const { questions: q2 } = await otherDocAI.getDocumentQuestions(documentTypeLabel || documentTypeId);
            resolved = q2 || [];
          }
          setQuestions(resolved || []);
          // 3) Store in memory
          if (resolved && resolved.length) {
            await storeAiMemory({
              document_type: documentTypeLabel || documentTypeId,
              context,
              profile_id: selectedProfile?.id || null,
              program_id: selectedProgramId || null,
              questions: resolved,
              metadata: { source: 'ai', ts: Date.now() },
            });
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal content */}
      <div className="absolute inset-0 flex flex-col bg-background">
        {/* Top bar */}
        <div className="flex items-center gap-3 p-4 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <Button variant="ghost" onClick={onBack} className="px-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">AI Guided Setup</p>
            <h2 className="text-lg font-semibold">{documentTypeLabel}</h2>
          </div>
          {loading ? (
            <div className="h-4 w-12 bg-muted rounded animate-pulse" />
          ) : (
            <div className="text-sm text-muted-foreground">{Math.min(current + 1, total)} / {total}</div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" aria-busy={loading}>
          {stage === 'profile' ? (
            loading ? (
              <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div className="h-6 w-1/2 bg-muted rounded animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted rounded animate-pulse" />
                  ))}
                </div>
                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                <div className="h-10 w-48 bg-muted rounded animate-pulse" />
              </div>
            ) : (
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <h3 className="text-xl font-semibold">Choose a profile to use</h3>
              
              <div className="space-y-3">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profiles.map((p) => (
                    <Button
                      key={p.id}
                      variant={selectedProfile?.id === p.id ? 'default' : 'outline'}
                      onClick={() => {
                        if (selectedProfile?.id === p.id) {
                          setSelectedProfile(null);
                        } else {
                          setSelectedProfile(p);
                        }
                      }}
                      aria-pressed={selectedProfile?.id === p.id}
                      className="w-full text-left whitespace-normal break-words leading-snug flex items-start justify-between gap-2 h-14"
                    >
                      <span className="block">
                        {p.degree} in {p.fields} from {p.origin_country}
                      </span>
                      {selectedProfile?.id === p.id && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 shrink-0">
                          <Check className="h-3 w-3" /> Selected
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">You can also continue without a profile.</p>
                <Button variant={selectedProfile ? 'outline' : 'default'} onClick={() => setSelectedProfile(null)}>
                  Write without a profile
                </Button>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={handleProfileNext}>Next</Button>
              </div>
            </div>
            )
          ) : stage === 'program' ? (
            loading ? (
              <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ) : (
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <h3 className="text-xl font-semibold">What program are you writing for?</h3>
              <p className="text-sm text-muted-foreground">Select a program. Your selected programs from applications are prioritized.</p>
              <div className="space-y-3">
                <div className="relative" ref={programDropdownRef}>
                  <Input
                    placeholder="Search programs (course or university)…"
                    value={programQuery}
                    onChange={(e) => { setProgramQuery(e.target.value); setProgramOpen(true); }}
                    onFocus={async () => {
                      setProgramOpen(true);
                      if (!allProgramsLoaded) {
                        // Fetch full list once, then cache in service
                        const all = await getAllPrograms();
                        if (Array.isArray(all) && all.length) {
                          setPrograms(all);
                          setAllProgramsLoaded(true);
                        }
                      }
                    }}
                    aria-expanded={programOpen}
                    aria-controls="program-dropdown"
                  />
                  {programOpen && (
                    <div
                      id="program-dropdown"
                      className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg max-h-80 overflow-y-auto"
                    >
                      <ul className="divide-y">
                        {filteredPrograms
                          .slice(0, 200)
                          .map((p) => {
                            const course = (p as any).course_name || (p as any).name || 'Unnamed course';
                            const uni = (p as any).university_name;
                            const label = uni ? `${course} — ${uni}` : course;
                            const preferred = preferredSet.has(p.id);
                            return (
                              <li key={p.id}>
                                <button
                                  type="button"
                                  className={cn(
                                    "w-full text-left px-3 py-2 hover:bg-muted/50 flex items-center gap-2",
                                    selectedProgramId === p.id ? "bg-muted/40" : ""
                                  )}
                                  onClick={() => {
                                    setSelectedProgramId(p.id);
                                    setProgramQuery(label);
                                    setProgramOpen(false);
                                  }}
                                >
                                  <span className="shrink-0 text-yellow-500" aria-hidden>{preferred ? '★' : ''}</span>
                                  <span className="truncate">{label}</span>
                                </button>
                              </li>
                            );
                          })}
                        {filteredPrograms.length === 0 && (
                          <li className="px-3 py-2 text-sm text-muted-foreground">No programs found</li>
                        )}
                        {filteredPrograms.length > 200 && (
                          <li className="px-3 py-2 text-xs text-muted-foreground">Showing top 200 results. Type to refine…</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Program link (if not listed)</label>
                  <Input placeholder="https://…" value={customProgramLink} onChange={(e) => setCustomProgramLink(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStage('profile')}>Back</Button>
                <Button onClick={handleProgramNext} disabled={!selectedProgramId && !customProgramLink}>Next</Button>
              </div>
            </div>
            )
          ) : stage === 'confirm' ? (
            loading ? (
              <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
                <div className="grid gap-3">
                  <div className="h-28 bg-muted rounded animate-pulse" />
                  <div className="h-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex justify-between pt-4 border-t">
                  <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ) : (
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <h3 className="text-xl font-semibold">Confirm background details</h3>
              <div className="grid gap-3">
                {selectedProfile ? (
                  <div className="rounded border p-4 bg-muted/30">
                    <div className="text-sm text-muted-foreground">The accademic document will be personalized based on your profile and academic background</div>
                    <div className="mt-2 text-sm">
                      <div>Fields of Study: {Array.isArray(selectedProfile.fields) ? selectedProfile.fields.join(', ') : (selectedProfile.fields || '—')}</div>
                      <div>University: {selectedProfile.university || '—'}</div>
                      <div>Country: {selectedProfile.university_country || '—'}</div>
                      {/* <div>Study Environment: {Array.isArray(selectedProfile.study_envs) ? selectedProfile.study_envs.join(', ') : (selectedProfile.study_envs || '—')}</div> */}
                      <div>Interest Topics: {Array.isArray(selectedProfile.interest_keywords) ? selectedProfile.interest_keywords.join(', ') : (selectedProfile.interest_keywords || '—')}</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded border p-4 bg-muted/30 text-sm">No profile selected</div>
                )}
                <div className="rounded border p-4 bg-muted/30 text-sm">
                  <div className="font-medium">Program</div>
                  <div>
                    {selectedProgramId ? (
                      (() => {
                        const p = programs.find(p => p.id === selectedProgramId);
                        if (!p) return 'No program selected';
                        const course = (p as any).course_name || (p as any).name || 'Unnamed course';
                        const uni = (p as any).university_name;
                        return uni ? `${course} — ${uni}` : course;
                      })()
                    ) : 'No program selected'}
                  </div>
                  {customProgramLink && <div className="text-muted-foreground">Link: {customProgramLink}</div>}
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setStage('program')}>Back</Button>
                <Button onClick={handleConfirmNext}>Continue</Button>
              </div>
            </div>
            )
          ) : (
            loading ? (
              <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                <div className="h-6 w-2/3 bg-muted rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-40 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="h-9 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-9 w-36 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ) : (
            <div className="max-w-3xl mx-auto p-6 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Question {current + 1} of {total}</p>
                <h3 className="text-2xl font-semibold leading-snug">{questions[current]}</h3>
              </div>

              <div className="space-y-2">
                <Textarea
                  value={currentAnswer}
                  onChange={(e) => { setTyping(true); setAnswer(e.target.value); }}
                  onBlur={() => setTyping(false)}
                  placeholder="Type your answer..."
                  rows={8}
                  className="resize-none"
                />
                {suggestion && (
                  <div className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Sparkles className="h-3 w-3" /> AI suggestion:</span> {suggestion}
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {suggestions.slice(0, 3).map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="px-2 py-1 rounded border hover:bg-muted"
                        onClick={() => { setAnswer(s); setTyping(false); setSuggestion(s); }}
                        aria-label={`Use suggestion ${i + 1}`}
                      >{s}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>Back</Button>
                {current < total - 1 ? (
                  <Button onClick={() => setCurrent(c => Math.min(total - 1, c + 1))} disabled={!canNext}>Next</Button>
                ) : (
                  <Button onClick={handleComplete} disabled={!canNext || generating}>
                    {generating ? 'Generating…' : 'Generate Document'}
                  </Button>
                )}
              </div>
            </div>
            )
          )}
        </div>
      </div>
      {generating && (
        <div className="absolute inset-0 bg-white/70 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-3xl mx-auto p-6 space-y-4">
            <div className="h-6 w-1/3 bg-muted rounded animate-pulse" />
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-5 w-full bg-muted rounded animate-pulse" />
            ))}
            <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherDocQuestionsModal;
