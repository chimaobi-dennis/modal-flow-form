import React, { useState, useEffect } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Globe,
  Heart,
  Folder,
  BookOpen,
  Users,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  FileText,
  Star,
  Shield,
  Hash,
  Check,
  X
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';

interface ResumeFormProps {
  data: any;
  onChange: (data: any) => void;
  // If provided, only this section will be rendered (used for collapsed sidebar popup)
  focusSection?: string;
}

// Sortable Experience Item Component
const SortableExperienceItem = ({ id, children, isExpanded, onToggleExpand, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="relative group"
      {...props}
    >
      <div 
        className="absolute -left-8 top-0 h-full flex items-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      <div 
        className="absolute right-4 top-4 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={onToggleExpand}
      >
        {isExpanded ? <ChevronUp /> : <ChevronDown />}
      </div>
      {children}
    </div>
  );
};

// Generic Sortable wrapper for array sections (education, skills, languages, awards, etc.)
const SortableGenericItem = ({ id, children, className = '', ...props }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className={`relative group ${className}`} {...props}>
      <div
        className="absolute -left-8 top-0 h-full flex items-center cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
      {children}
    </div>
  );
};

// Top-level Sortable wrapper for sections list
const SortableSection = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        className="absolute right-9 top-1.5 h-8 w-7 flex items-center justify-center z-10 cursor-grab active:cursor-grabbing rounded-md hover:bg-gray-200/60 text-gray-500"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
        title="Drag to reorder section"
        aria-label="Drag to reorder section"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      {children}
    </div>
  );
};

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  fields?: any;
  isArray?: boolean;
  isCustom?: boolean;
}

export const ResumeForm: React.FC<ResumeFormProps> = ({ data, onChange, focusSection }) => {
  useEffect(() => {
    console.log('[ResumeBuilder] ResumeForm mounted');
  }, []);

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set([focusSection || 'basics'])
  );

  // DnD sensors must be defined at the top level to satisfy React Hooks rules
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Top-level state for Basics social profile quick-add inputs (must not be inside nested renderers)
  const [newProfilePlatform, setNewProfilePlatform] = useState<string>('linkedin');
  const [newProfileUrl, setNewProfileUrl] = useState<string>('');
  const [newProfileUsername, setNewProfileUsername] = useState<string>('');

  const sections: Section[] = [
    {
      id: 'basics',
      title: 'Basics',
      icon: <User className="w-4 h-4" />,
      fields: data.basics || {}
    },
    {
      id: 'summary',
      title: 'Summary',
      icon: <FileText className="w-4 h-4" />,
      fields: data.summary || ''
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="w-4 h-4" />,
      fields: data.profile || {}
    },
    {
      id: 'experience',
      title: 'Experience',
      icon: <Briefcase className="w-4 h-4" />,
      fields: data.experience || [],
      isArray: true
    },
    {
      id: 'education',
      title: 'Education',
      icon: <GraduationCap className="w-4 h-4" />,
      fields: data.education || [],
      isArray: true
    },
    {
      id: 'skills',
      title: 'Skills',
      icon: <Star className="w-4 h-4" />,
      fields: data.skills || [],
      isArray: true
    },
    {
      id: 'languages',
      title: 'Languages',
      icon: <Globe className="w-4 h-4" />,
      fields: data.languages || [],
      isArray: true
    },
    {
      id: 'awards',
      title: 'Awards',
      icon: <Award className="w-4 h-4" />,
      fields: data.awards || [],
      isArray: true
    },
    {
      id: 'certifications',
      title: 'Certifications',
      icon: <Shield className="w-4 h-4" />,
      fields: data.certifications || [],
      isArray: true
    },
    {
      id: 'interests',
      title: 'Interests',
      icon: <Heart className="w-4 h-4" />,
      fields: data.interests || [],
      isArray: true
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: <Folder className="w-4 h-4" />,
      fields: data.projects || [],
      isArray: true
    },
    {
      id: 'publications',
      title: 'Publications',
      icon: <BookOpen className="w-4 h-4" />,
      fields: data.publications || [],
      isArray: true
    },
    {
      id: 'volunteering',
      title: 'Volunteering',
      icon: <Users className="w-4 h-4" />,
      fields: data.volunteering || [],
      isArray: true
    },
    {
      id: 'custom',
      title: 'Custom Section',
      icon: <Hash className="w-4 h-4" />,
      fields: data.custom || [],
      isArray: true,
      isCustom: true
    }
  ];

  // Sections Manager (In-use / Not in use) state reported by template
  const [sectorLeft, setSectorLeft] = useState<string[]>([]);
  const [sectorRight, setSectorRight] = useState<string[]>([]);
  const [sectorUnused, setSectorUnused] = useState<string[]>([]);
  const [supportsTwoColumns, setSupportsTwoColumns] = useState<boolean>(false);

  // Bridge: receive current placement from template
  useEffect(() => {
    const handler = (evt: Event) => {
      const e = evt as CustomEvent<any>;
      const { left = [], right = [], unused, supportsTwoColumns: twoCols = false } = e.detail || {};
      let L: string[] = Array.isArray(left) ? [...left] : [];
      let R: string[] = Array.isArray(right) ? [...right] : [];
      // Derive 'unused' from all known sections regardless of template value
      // Exclude fixed sections: contact, basics, summary
      const allIds = sections.map((s) => s.id).filter((id) => id !== 'contact' && id !== 'basics' && id !== 'summary');
      // Ensure basics is always in use
      const hasBasics = sections.some((s) => s.id === 'basics');
      if (hasBasics && !L.includes('basics') && !R.includes('basics')) {
        L = ['basics', ...L];
      }
      // Ensure summary is always in use
      const hasSummary = sections.some((s) => s.id === 'summary');
      if (hasSummary && !L.includes('summary') && !R.includes('summary')) {
        L = [...L, 'summary'];
      }
      const U: string[] = allIds.filter((id) => !L.includes(id) && !R.includes(id));
      setSectorLeft(L);
      setSectorRight(R);
      setSectorUnused(U);
      setSupportsTwoColumns(!!twoCols);
    };
    window.addEventListener('resume:reportSections', handler as EventListener);
    return () => window.removeEventListener('resume:reportSections', handler as EventListener);
  }, []);

  // Helper to dispatch updates back to template
  const pushSectors = (left: string[], right: string[]) => {
    try {
      const detail = { left, right };
      window.dispatchEvent(new CustomEvent('resume:setSections', { detail }));
      window.parent?.postMessage({ type: 'resume:setSections', ...detail }, '*');
    } catch {}
  };

  const moveTo = (id: string, from: 'left'|'right'|'unused', to: 'left'|'right'|'unused') => {
    if (from === to) return;
    // basics and summary must always remain in use
    if ((id === 'basics' || id === 'summary') && to === 'unused') return;
    const l = [...sectorLeft];
    const r = [...sectorRight];
    const u = [...sectorUnused];
    const removeFrom = (arr: string[]) => { const i = arr.indexOf(id); if (i !== -1) arr.splice(i, 1); };
    if (from === 'left') removeFrom(l); else if (from === 'right') removeFrom(r); else removeFrom(u);
    if (to === 'left') l.push(id); else if (to === 'right') r.push(id); else u.push(id);
    setSectorLeft(l); setSectorRight(r); setSectorUnused(u);
    pushSectors(l, r);
  };

  const reorderIn = (which: 'left'|'right'|'unused', index: number, dir: -1|1) => {
    const arr = which === 'left' ? [...sectorLeft] : which === 'right' ? [...sectorRight] : [...sectorUnused];
    const i = index;
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    if (which === 'left') setSectorLeft(arr);
    else if (which === 'right') setSectorRight(arr);
    else setSectorUnused(arr);
    pushSectors(which === 'left' ? arr : sectorLeft, which === 'right' ? arr : sectorRight);
  };

  // Multi-container DnD across Left / Right / Unused sectors
  const sectorsInitialized = (sectorLeft.length + sectorRight.length + sectorUnused.length) > 0;
  const sectionById = new Map(sections.map((s) => [s.id, s] as const));

  const handleSectorsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const id = String(active.id);
    const overId = String(over.id);
    // prevent moving basics/summary into 'unused'
    const overContainerProbe = (sid: string): 'left'|'right'|'unused'|null => {
      if (sectorLeft.includes(sid)) return 'left';
      if (sectorRight.includes(sid)) return 'right';
      if (sectorUnused.includes(sid)) return 'unused';
      return null;
    };
    const overContainer = overContainerProbe(overId);
    if ((id === 'basics' || id === 'summary') && overContainer === 'unused') return;
    const findContainer = (sid: string): 'left'|'right'|'unused'|null => {
      if (sectorLeft.includes(sid)) return 'left';
      if (sectorRight.includes(sid)) return 'right';
      if (sectorUnused.includes(sid)) return 'unused';
      return null;
    };
    const from = findContainer(id);
    const to = overContainer || from; // if drop on same container header, keep it
    if (!from || !to) return;
    // Clone arrays
    const L = [...sectorLeft];
    const R = [...sectorRight];
    const U = [...sectorUnused];
    const takeOut = (arr: string[]) => { const i = arr.indexOf(id); if (i !== -1) arr.splice(i, 1); };
    if (from === 'left') takeOut(L); else if (from === 'right') takeOut(R); else takeOut(U);
    const target = to === 'left' ? L : to === 'right' ? R : U;
    const overIndex = target.indexOf(overId);
    const insertAt = overIndex >= 0 ? overIndex : target.length;
    target.splice(insertAt, 0, id);
    setSectorLeft(L); setSectorRight(R); setSectorUnused(U);
    pushSectors(L, R);
  };

  // Maintain a user-defined order of sections
  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const fromData = Array.isArray((data as any)?.sectionOrder) ? (data as any).sectionOrder : null;
    const defaultOrder = sections.map((s) => s.id);
    if (fromData) {
      // keep only known ids and append any new ones
      const known = fromData.filter((id) => defaultOrder.includes(id));
      const extras = defaultOrder.filter((id) => !known.includes(id));
      return [...known, ...extras];
    }
    return defaultOrder;
  });

  // Sync when template sections change (e.g., after load)
  useEffect(() => {
    const defaultOrder = sections.map((s) => s.id);
    setSectionOrder((prev) => {
      const known = (Array.isArray(prev) ? prev : []).filter((id) => defaultOrder.includes(id));
      const extras = defaultOrder.filter((id) => !known.includes(id));
      const next = [...known, ...extras];
      // persist to data if changed
      if (JSON.stringify((data as any)?.sectionOrder || []) !== JSON.stringify(next)) {
        onChange({ ...data, sectionOrder: next });
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(sections.map((s) => s.id))]);

  // If focusSection is provided, filter to only that section when rendering
  const visibleSections = focusSection
    ? sections.filter((s) => s.id === focusSection)
    : sections;

  // Apply ordering to visible sections
  const orderedSections = (focusSection ? visibleSections : [...visibleSections].sort((a, b) => {
    return sectionOrder.indexOf(a.id) - sectionOrder.indexOf(b.id);
  }));

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = (section: string, field: string, value: any) => {
    const newData = { ...data };
    if (!newData[section]) {
      newData[section] = {};
    }
    if (field) {
      newData[section][field] = value;
    } else {
      newData[section] = value;
    }
    onChange(newData);
  };

  const addArrayItem = (section: string) => {
    const newData = { ...data };
    if (!newData[section]) {
      newData[section] = [];
    }
    newData[section].push(getEmptyItem(section));
    onChange(newData);
  };

  const removeArrayItem = (section: string, index: number) => {
    const newData = { ...data };
    newData[section].splice(index, 1);
    onChange(newData);
  };

  const updateArrayItem = (section: string, index: number, field: string, value: any) => {
    const newData = { ...data };
    if (!newData[section][index]) {
      newData[section][index] = {};
    }
    newData[section][index][field] = value;
    onChange(newData);
  };

  const getEmptyItem = (section: string) => {
    switch (section) {
      case 'experience':
        return {
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          description: '',
          location: ''
        };
      case 'education':
        return {
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: ''
        };
      case 'skills':
        return { name: '', level: '' };
      case 'languages':
        return { name: '', proficiency: '' };
      case 'awards':
        return { title: '', date: '', issuer: '', description: '' };
      case 'certifications':
        return { name: '', issuer: '', date: '', url: '' };
      case 'interests':
        return { name: '' };
      case 'projects':
        return { name: '', description: '', url: '', startDate: '', endDate: '' };
      case 'publications':
        return { title: '', publisher: '', date: '', url: '', description: '' };
      case 'volunteering':
        return { organization: '', position: '', startDate: '', endDate: '', description: '' };
      case 'custom':
        return { title: '', content: '' };
      default:
        return {};
    }
  };

  const renderBasicsSection = () => {
    const basics = data.basics || {};
    const profiles: Array<{ platform?: string; url?: string; username?: string }>
      = Array.isArray(basics.profiles) ? basics.profiles : [];

    const addProfile = () => {
      const next = [...profiles, {
        platform: newProfilePlatform,
        url: newProfileUrl || undefined,
        username: newProfileUsername || undefined
      }];
      updateField('basics', 'profiles', next);
      // Reset to quickly collect the next profile
      setNewProfileUrl('');
      setNewProfileUsername('');
    };
    const removeProfile = (idx: number) => {
      const next = profiles.slice();
      next.splice(idx, 1);
      updateField('basics', 'profiles', next);
    };
    const editProfile = (idx: number, patch: Partial<{ platform: string; url: string; username: string }>) => {
      const next = profiles.slice();
      next[idx] = { ...next[idx], ...patch };
      updateField('basics', 'profiles', next);
    };
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Full Name</Label>
            <Input
              value={basics.fullName || ''}
              onChange={(e) => updateField('basics', 'fullName', e.target.value)}
              placeholder="John Doe"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Headline</Label>
            <Input
              value={basics.headline || ''}
              onChange={(e) => updateField('basics', 'headline', e.target.value)}
              placeholder="Software Developer"
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={basics.email || ''}
              onChange={(e) => updateField('basics', 'email', e.target.value)}
              placeholder="john@example.com"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Phone</Label>
            <Input
              value={basics.phone || ''}
              onChange={(e) => updateField('basics', 'phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Website</Label>
            <Input
              value={basics.website || ''}
              onChange={(e) => updateField('basics', 'website', e.target.value)}
              placeholder="https://example.com"
              className="h-9 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Location</Label>
            <Input
              value={basics.location || ''}
              onChange={(e) => updateField('basics', 'location', e.target.value)}
              placeholder="New York, NY"
              className="h-9 text-sm"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs">Picture URL</Label>
          <Input
            value={basics.picture || ''}
            onChange={(e) => updateField('basics', 'picture', e.target.value)}
            placeholder="https://example.com/photo.jpg"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs">Social Profiles</Label>
          <div className="grid grid-cols-3 gap-2">
            <select
              className="border rounded h-9 text-sm px-2"
              value={newProfilePlatform}
              onChange={(e) => setNewProfilePlatform(e.target.value)}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="facebook">Facebook</option>
              <option value="x">X (Twitter)</option>
              <option value="github">GitHub</option>
              <option value="portfolio">Portfolio</option>
              <option value="other">Other</option>
            </select>
            <Input
              value={newProfileUsername}
              onChange={(e) => setNewProfileUsername(e.target.value)}
              placeholder="Username/Handle (optional)"
              className="h-9 text-sm"
            />
            <Input
              value={newProfileUrl}
              onChange={(e) => setNewProfileUrl(e.target.value)}
              placeholder="Profile URL (optional)"
              className="h-9 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" size="sm" variant="outline" onClick={addProfile}>
              <Plus className="w-3 h-3 mr-1" /> Add profile
            </Button>
          </div>
          {profiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {profiles.map((p, idx) => (
                <div key={idx} className="group inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 text-xs">
                  <span className="font-medium">{p.platform}</span>
                  {p.username && <span>@{p.username}</span>}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                      link
                    </a>
                  )}
                  <button
                    type="button"
                    className="opacity-60 hover:opacity-100"
                    onClick={() => editProfile(idx, { /* simple inline edit could open a modal; for now toggle to input */ })}
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button type="button" className="opacity-60 hover:opacity-100" onClick={() => removeProfile(idx)} title="Remove">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {/* Add custom field logic */}}
        >
          <Plus className="w-3 h-3 mr-2" />
          Add a custom field
        </Button>
      </div>
    );
  };

  const renderSummarySection = () => {
    return (
      <div>
        <Textarea
          value={data.summary || ''}
          onChange={(e) => updateField('summary', '', e.target.value)}
          placeholder="Write a brief summary about yourself..."
          className="min-h-[120px] text-sm"
        />
      </div>
    );
  };

  const renderExperienceSection = () => {
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = data.experience.findIndex((exp: any, i: number) => (exp?.id ?? `exp-${i}`) === active.id);
        const newIndex = data.experience.findIndex((exp: any, i: number) => (exp?.id ?? `exp-${i}`) === over?.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newExperience = arrayMove(data.experience, oldIndex, newIndex);
          onChange({ ...data, experience: newExperience });
        }
      }
    };

    const toggleExpand = (id: string) => {
      const newExpanded = new Set(expandedSections);
      if (newExpanded.has(`exp-${id}`)) {
        newExpanded.delete(`exp-${id}`);
      } else {
        newExpanded.add(`exp-${id}`);
      }
      setExpandedSections(newExpanded);
    };
    const experiences = data.experience || [];
    return (
      <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={experiences.map((exp: any, idx: number) => exp?.id ?? `exp-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4 ml-6">
              {experiences.map((exp: any, index: number) => {
                const expId = exp?.id ?? `exp-${index}`;
                const isExpanded = expandedSections.has(`exp-${expId}`);
                return (
                  <SortableExperienceItem
                    key={expId}
                    id={expId}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleExpand(String(expId))}
                  >
                    <div className={`p-4 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow ${!isExpanded ? 'pb-2' : ''}`}>
                      {!isExpanded ? (
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{exp.position || 'Untitled Position'}</h4>
                            <p className="text-sm text-gray-600">
                              {(exp.company || 'Company')}{exp.location ? `, ${exp.location}` : ''}
                              {' • '}{exp.startDate || ''} - {exp.current ? 'Present' : (exp.endDate || '')}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                              <Input
                                value={exp.company || ''}
                                onChange={(e) => updateArrayItem('experience', index, 'company', e.target.value)}
                                placeholder="Company"
                                className="h-9 text-sm"
                              />
                              <Input
                                value={exp.position || ''}
                                onChange={(e) => updateArrayItem('experience', index, 'position', e.target.value)}
                                placeholder="Position"
                                className="h-9 text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                              <Input
                                type="date"
                                value={exp.startDate || ''}
                                onChange={(e) => updateArrayItem('experience', index, 'startDate', e.target.value)}
                                className="h-9 text-sm"
                              />
                              <Input
                                type="date"
                                value={exp.current ? '' : (exp.endDate || '')}
                                onChange={(e) => updateArrayItem('experience', index, 'endDate', e.target.value)}
                                className="h-9 text-sm w-full"
                                placeholder={exp.current ? 'Present' : ''}
                                title={exp.current ? 'Present' : ''}
                                disabled={!!exp.current}
                              />
                              <label className="flex items-center gap-2 text-xs whitespace-normal sm:col-span-2">
                                <input
                                  type="checkbox"
                                  checked={!!exp.current}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    updateArrayItem('experience', index, 'current', checked);
                                    updateArrayItem('experience', index, 'present', checked);
                                    if (checked) updateArrayItem('experience', index, 'endDate', 'Present');
                                  }}
                                />
                                I currently work here
                              </label>
                            </div>
                            <Input
                              value={exp.location || ''}
                              onChange={(e) => updateArrayItem('experience', index, 'location', e.target.value)}
                              placeholder="Location"
                              className="h-9 text-sm"
                            />
                            <div className="space-y-2">
                              <Label className="text-xs">Descriptions</Label>
                              <div className="space-y-2">
                                {(Array.isArray(exp.descriptions) ? exp.descriptions : []).map((d: string, i: number) => {
                                  const isEditing = exp.__editingDescIndex === i;
                                  return (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-50 transition-colors">
                                      {isEditing ? (
                                        <>
                                          <Textarea
                                            className="flex-1 text-sm min-h-[60px] resize-none"
                                            value={exp.__editingDescValue || ''}
                                            onChange={(e) => updateArrayItem('experience', index, '__editingDescValue', e.target.value)}
                                            autoFocus
                                          />
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button type="button" className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors" onClick={() => {
                                              updateArrayItem('experience', index, '__editingDescIndex', -1);
                                              updateArrayItem('experience', index, '__editingDescValue', '');
                                            }} title="Cancel">
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                            <button type="button" className="p-1 rounded hover:bg-green-100 text-gray-500 hover:text-green-600 transition-colors" onClick={() => {
                                              const val = String(exp.__editingDescValue || '').trim();
                                              if (val) {
                                                const arr = Array.isArray(exp.descriptions) ? [...exp.descriptions] : [];
                                                arr[i] = val;
                                                updateArrayItem('experience', index, 'descriptions', arr);
                                              }
                                              updateArrayItem('experience', index, '__editingDescIndex', -1);
                                              updateArrayItem('experience', index, '__editingDescValue', '');
                                            }} title="Save">
                                              <Check className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="flex-1 text-sm text-gray-700 leading-relaxed">{d}</div>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button type="button" className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors" onClick={() => {
                                              updateArrayItem('experience', index, '__editingDescIndex', i);
                                              updateArrayItem('experience', index, '__editingDescValue', d);
                                            }} title="Edit">
                                              <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                            <button type="button" className="p-1 rounded hover:bg-red-100 text-gray-500 hover:text-red-600 transition-colors" onClick={() => {
                                              const arr = Array.isArray(exp.descriptions) ? [...exp.descriptions] : [];
                                              arr.splice(i, 1);
                                              updateArrayItem('experience', index, 'descriptions', arr);
                                            }} title="Remove">
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="relative">
                                <Input
                                  placeholder="Add description..."
                                  className="h-10 text-sm pr-20 w-full"
                                  value={exp.__newDesc || ''}
                                  onChange={(e) => updateArrayItem('experience', index, '__newDesc', e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const val = (e.target as HTMLInputElement).value.trim();
                                      if (!val) return;
                                      const arr = Array.isArray(exp.descriptions) ? [...exp.descriptions] : [];
                                      arr.push(val);
                                      updateArrayItem('experience', index, 'descriptions', arr);
                                      updateArrayItem('experience', index, '__newDesc', '');
                                    }
                                  }}
                                />
                                <Button type="button" size="sm" variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 px-2 text-xs hover:bg-blue-50 hover:text-blue-600 transition-colors" onClick={() => {
                                  const val = String(exp.__newDesc || '').trim();
                                  if (!val) return;
                                  const arr = Array.isArray(exp.descriptions) ? [...exp.descriptions] : [];
                                  arr.push(val);
                                  updateArrayItem('experience', index, 'descriptions', arr);
                                  updateArrayItem('experience', index, '__newDesc', '');
                                }} disabled={!exp.__newDesc?.trim()}>
                                  <Plus className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeArrayItem('experience', index)} className="ml-2">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </SortableExperienceItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        <Button variant="outline" size="sm" className="w-full mt-3" onClick={() => addArrayItem('experience')}>
          <Plus className="w-3 h-3 mr-2" /> Add Experience
        </Button>
      </>
    );
  };

  const renderEducationSection = () => {
    const educations = data.education || [];
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = educations.findIndex((edu: any, i: number) => (edu?.id ?? `edu-${i}`) === active.id);
        const newIndex = educations.findIndex((edu: any, i: number) => (edu?.id ?? `edu-${i}`) === over?.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newEducation = arrayMove(educations, oldIndex, newIndex);
          onChange({ ...data, education: newEducation });
        }
      }
    };
    return (
      <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={educations.map((edu: any, i: number) => edu?.id ?? `edu-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {educations.map((edu: any, index: number) => (
                <SortableGenericItem key={edu?.id ?? `edu-${index}`} id={edu?.id ?? `edu-${index}`}>
                  <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 space-y-3">
                <Input
                  value={edu.institution || ''}
                  onChange={(e) => updateArrayItem('education', index, 'institution', e.target.value)}
                  placeholder="Institution"
                  className="h-9 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={edu.degree || ''}
                    onChange={(e) => updateArrayItem('education', index, 'degree', e.target.value)}
                    placeholder="Degree"
                    className="h-9 text-sm"
                  />
                  <Input
                    value={edu.field || ''}
                    onChange={(e) => updateArrayItem('education', index, 'field', e.target.value)}
                    placeholder="Field of Study"
                    className="h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="date"
                    value={edu.startDate || ''}
                    onChange={(e) => updateArrayItem('education', index, 'startDate', e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    type="date"
                    value={edu.endDate || ''}
                    onChange={(e) => updateArrayItem('education', index, 'endDate', e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Input
                    value={edu.gpa || ''}
                    onChange={(e) => updateArrayItem('education', index, 'gpa', e.target.value)}
                    placeholder="GPA"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeArrayItem('education', index)}
                className="ml-2"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
                  </div>
                </SortableGenericItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem('education')}
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-2" />
          Add Education
        </Button>
      </>
    );
  };

  const renderSkillsSection = () => {
    const skills = data.skills || [];
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = skills.findIndex((s: any, i: number) => (s?.id ?? `skill-${i}`) === active.id);
        const newIndex = skills.findIndex((s: any, i: number) => (s?.id ?? `skill-${i}`) === over?.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newSkills = arrayMove(skills, oldIndex, newIndex);
          onChange({ ...data, skills: newSkills });
        }
      }
    };
    return (
      <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={skills.map((s: any, i: number) => s?.id ?? `skill-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {skills.map((skill: any, index: number) => (
                <SortableGenericItem key={skill?.id ?? `skill-${index}`} id={skill?.id ?? `skill-${index}`}>
                  <div className="flex gap-2">
                    <Input
                      value={skill.name || ''}
                      onChange={(e) => updateArrayItem('skills', index, 'name', e.target.value)}
                      placeholder="Skill name"
                      className="h-9 text-sm flex-1"
                    />
                    <select
                      value={skill.level || ''}
                      onChange={(e) => updateArrayItem('skills', index, 'level', e.target.value)}
                      className="h-9 px-3 text-sm border rounded-md"
                    >
                      <option value="">Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Expert">Expert</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem('skills', index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </SortableGenericItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem('skills')}
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-2" />
          Add Skill
        </Button>
      </>
    );
  };

  const renderArraySection = (sectionId: string) => {
    switch (sectionId) {
      case 'experience':
        return renderExperienceSection();
      case 'education':
        return renderEducationSection();
      case 'skills':
        return renderSkillsSection();
      // Add more specific renderers for other sections as needed
      default:
        return renderGenericArraySection(sectionId);
    }
  };

  const renderGenericArraySection = (sectionId: string) => {
    const items = data[sectionId] || [];
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (active.id !== over?.id) {
        const oldIndex = items.findIndex((it: any, i: number) => (it?.id ?? `${sectionId}-${i}`) === active.id);
        const newIndex = items.findIndex((it: any, i: number) => (it?.id ?? `${sectionId}-${i}`) === over?.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          onChange({ ...data, [sectionId]: newItems });
        }
      }
    };
    return (
      <>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={items.map((it: any, i: number) => it?.id ?? `${sectionId}-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((item: any, index: number) => (
                <SortableGenericItem key={item?.id ?? `${sectionId}-${index}`} id={item?.id ?? `${sectionId}-${index}`}>
                  <div className="border rounded-lg p-3 space-y-2">
                    {Object.keys(getEmptyItem(sectionId)).map((field) => (
                      <Input
                        key={field}
                        value={item[field] || ''}
                        onChange={(e) => updateArrayItem(sectionId, index, field, e.target.value)}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        className="h-9 text-sm"
                      />
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeArrayItem(sectionId, index)}
                      className="w-full"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </SortableGenericItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(sectionId)}
          className="w-full"
        >
          <Plus className="w-3 h-3 mr-2" />
          Add {sections.find(s => s.id === sectionId)?.title}
        </Button>
      </>
    );
  };

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(String(active.id));
    const newIndex = sectionOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(sectionOrder, oldIndex, newIndex);
    setSectionOrder(next);
    onChange({ ...data, sectionOrder: next });
  };

  return (
    <div className="space-y-4">
      {focusSection ? (
        visibleSections.map((section) => (
          <div key={section.id} className="border rounded-lg overflow-hidden mb-4">
            <div
              className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-3">
                {section.icon}
                <span className="font-medium text-sm">{section.title}</span>
              </div>
              {expandedSections.has(section.id) ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
            {expandedSections.has(section.id) && (
              <div className="px-4 pb-4 pt-2 border-t bg-gray-50/50">
                {section.id === 'basics' && renderBasicsSection()}
                {section.id === 'summary' && renderSummarySection()}
                {section.isArray && renderArraySection(section.id)}
              </div>
            )}
          </div>
        ))
      ) : (
        sectorsInitialized ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectorsDragEnd}>
            {/* In-use Main (Left) */}
            <div className="px-1 pt-1 pb-0 text-[11px] uppercase tracking-wide text-gray-500">In use — Main</div>
            <SortableContext items={sectorLeft} strategy={verticalListSortingStrategy}>
              {sectorLeft.map((sid) => {
                const section = sectionById.get(sid);
                if (!section) return null;
                return (
                  <SortableSection key={section.id} id={section.id}>
                    <div className="border rounded-lg overflow-hidden mb-4">
                      <div
                        className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-3">
                          {section.icon}
                          <span className="font-medium text-sm">{section.title}</span>
                        </div>
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      {expandedSections.has(section.id) && (
                        <div className="px-4 pb-4 pt-2 border-t bg-gray-50/50">
                          {section.id === 'basics' && renderBasicsSection()}
                          {section.id === 'summary' && renderSummarySection()}
                          {section.isArray && renderArraySection(section.id)}
                        </div>
                      )}
                    </div>
                  </SortableSection>
                );
              })}
            </SortableContext>

            {/* In-use Side (Right) if supported */}
            {supportsTwoColumns && (
              <>
                <div className="px-1 pt-2 pb-0 text-[11px] uppercase tracking-wide text-gray-500">In use — Side</div>
                <SortableContext items={sectorRight} strategy={verticalListSortingStrategy}>
                  {sectorRight.map((sid) => {
                    const section = sectionById.get(sid);
                    if (!section) return null;
                    return (
                      <SortableSection key={section.id} id={section.id}>
                        <div className="border rounded-lg overflow-hidden mb-4">
                          <div
                            className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection(section.id)}
                          >
                            <div className="flex items-center gap-3">
                              {section.icon}
                              <span className="font-medium text-sm">{section.title}</span>
                            </div>
                            {expandedSections.has(section.id) ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          {expandedSections.has(section.id) && (
                            <div className="px-4 pb-4 pt-2 border-t bg-gray-50/50">
                              {section.id === 'basics' && renderBasicsSection()}
                              {section.id === 'summary' && renderSummarySection()}
                              {section.isArray && renderArraySection(section.id)}
                            </div>
                          )}
                        </div>
                      </SortableSection>
                    );
                  })}
                </SortableContext>
              </>
            )}

            {/* Not In Use */}
            <div className="px-1 pt-2 pb-0 text-[11px] uppercase tracking-wide text-gray-500">Not in use</div>
            <SortableContext items={sectorUnused} strategy={verticalListSortingStrategy}>
              {sectorUnused.map((sid) => {
                const section = sectionById.get(sid);
                if (!section) return null;
                return (
                  <SortableSection key={section.id} id={section.id}>
                    <div className="border rounded-lg overflow-hidden mb-4 opacity-70">
                      <div
                        className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex items-center gap-3">
                          {section.icon}
                          <span className="font-medium text-sm">{section.title} (Not in use)</span>
                        </div>
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      {expandedSections.has(section.id) && (
                        <div className="px-4 pb-4 pt-2 border-t bg-gray-50/50">
                          {section.id === 'basics' && renderBasicsSection()}
                          {section.id === 'summary' && renderSummarySection()}
                          {section.isArray && renderArraySection(section.id)}
                        </div>
                      )}
                    </div>
                  </SortableSection>
                );
              })}
            </SortableContext>
          </DndContext>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={orderedSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {orderedSections.map((section) => (
                <SortableSection key={section.id} id={section.id}>
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <div
                      className="bg-gray-50 px-3 py-2 flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection(section.id)}
                    >
                      <div className="flex items-center gap-3">
                        {section.icon}
                        <span className="font-medium text-sm">{section.title}</span>
                      </div>
                      {expandedSections.has(section.id) ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    {expandedSections.has(section.id) && (
                      <div className="px-4 pb-4 pt-2 border-t bg-gray-50/50">
                        {section.id === 'basics' && renderBasicsSection()}
                        {section.id === 'summary' && renderSummarySection()}
                        {section.isArray && renderArraySection(section.id)}
                      </div>
                    )}
                  </div>
                </SortableSection>
              ))}
            </SortableContext>
          </DndContext>
        )
      )}
    </div>
  );
}
;
