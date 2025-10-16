export interface StudentProfile {
  id: number;
  name?: string;
  fields_of_study?: string[] | string;
  university?: string;
  university_country?: string;
  study_environment?: string;
  interest_keywords?: string[] | string;
  [key: string]: any;
}

export interface ProgramItem {
  id: number;
  name: string;
  [key: string]: any;
}

export interface UserApplication {
  id: number;
  profile_id?: number;
  selected_programs?: number[] | string;
  [key: string]: any;
}

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export async function getUserProfiles(userId: string | number): Promise<StudentProfile[]> {
  const res = await fetch(`https://uniplanr.com/api/v1/student-profiles/${userId}`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await safeJson(res);
  return Array.isArray(data) ? data : (data?.profiles || []);
}

export async function getPrograms(): Promise<ProgramItem[]> {
  const res = await fetch('https://uniplanr.com/api/v1/programs', { credentials: 'include' });
  if (!res.ok) return [];
  const data = await safeJson(res);
  console.log('getPrograms', data);
  // Handle plain array, { programs: [...] }, or Laravel paginator { data: [...], ... }
  if (Array.isArray(data)) return data as ProgramItem[];
  if (Array.isArray(data?.programs)) return data.programs;
  if (Array.isArray(data?.data)) return data.data as ProgramItem[];
  return [];
}

// Fetch all programs across paginated responses (follows next_page_url)
let __allProgramsCache: ProgramItem[] | null = null;
let __allProgramsInflight: Promise<ProgramItem[]> | null = null;

export async function getAllPrograms(maxPages: number = 100, useCache: boolean = true): Promise<ProgramItem[]> {
  if (useCache && __allProgramsCache) return __allProgramsCache;
  if (useCache && __allProgramsInflight) return __allProgramsInflight;
  const run = async () => {
    const results: ProgramItem[] = [];
    // Try to get everything in a single request using a large page size first
    const bigUrl = 'https://uniplanr.com/api/v1/programs?per_page=10000&page=1';
    try {
      const bigRes = await fetch(bigUrl, { credentials: 'include' });
      if (bigRes.ok) {
        const bigData = await safeJson(bigRes);
        const items: ProgramItem[] = Array.isArray(bigData)
          ? (bigData as ProgramItem[])
          : (Array.isArray(bigData?.programs)
            ? bigData.programs
            : (Array.isArray(bigData?.data) ? bigData.data : []));
        if (items.length > 0 && (!bigData?.next_page_url || items.length < 10000)) {
          __allProgramsCache = items;
          return items;
        }
        // If there is a next_page_url or items likely capped, fall through to pagination
        results.push(...items);
        if (bigData?.next_page_url) {
          let url: string | null = bigData.next_page_url as string;
          let pages = 1;
          while (url && pages < maxPages) {
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) break;
            const data = await safeJson(res);
            const pageItems: ProgramItem[] = Array.isArray(data?.programs)
              ? data.programs
              : (Array.isArray(data?.data) ? data.data : []);
            results.push(...pageItems);
            url = (data?.next_page_url as string) || null;
            pages += 1;
          }
          __allProgramsCache = results;
          return results;
        }
      }
    } catch {}

    // Fallback: standard pagination loop
    let url: string | null = 'https://uniplanr.com/api/v1/programs';
    let pages = 0;
    while (url && pages < maxPages) {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) break;
      const data = await safeJson(res);
      if (Array.isArray(data)) {
        // Non-paginated fallback
        results.push(...(data as ProgramItem[]));
        break;
      }
      const pageItems: ProgramItem[] = Array.isArray(data?.programs)
        ? data.programs
        : (Array.isArray(data?.data) ? data.data : []);
      results.push(...pageItems);
      url = (data?.next_page_url as string) || null;
      pages += 1;
      if (!url) break;
    }
    __allProgramsCache = results;
    return results;
  };
  __allProgramsInflight = run().finally(() => { __allProgramsInflight = null; });
  return __allProgramsInflight;
}

export async function getUserApplications(userId: string | number): Promise<UserApplication[]> {
  const res = await fetch(`https://uniplanr.com/api/v1/applications/${userId}`, { credentials: 'include' });
  if (!res.ok) return [];
  const data = await safeJson(res);
  console.log('getUserApplications', data);
  return Array.isArray(data) ? data : (data?.applications || []);
}

/**
 * Fetch programs and prioritize those referenced in the user's applications (selected_programs).
 * If profileId is provided, only application rows matching that profile_id are considered.
 */
export async function getProgramsPrioritizedByApplications(
  userId: string | number,
  options?: { profileId?: string | number }
): Promise<{ programs: ProgramItem[]; preferredIds: number[] }> {
  const [programs, applications] = await Promise.all([
    getAllPrograms(undefined, true),
    getUserApplications(userId),
  ]);

  // Collect program IDs from applications (group and single), optionally filtered by profileId
  const preferredSet = new Set<number>();
  for (const app of applications) {
    const appProfileId = (app as any).profile_id ?? (app as any).profileId;
    if (options?.profileId && String(appProfileId) !== String(options.profileId)) continue;

    // 1) Group applications: read groupData.programs (array of ids or objects with id)
    if ((app as any).isGroup) {
      const groupData = (app as any).groupData;
      const programs = groupData?.programs;
      if (Array.isArray(programs)) {
        programs.forEach((item: any) => {
          const n = Number(typeof item === 'object' ? (item?.id ?? item?.programId ?? item) : item);
          if (!Number.isNaN(n)) preferredSet.add(n);
        });
      }
    } else {
      // 2) Single application: use programId if present
      const pid = Number((app as any).programId ?? (app as any).program_id);
      if (!Number.isNaN(pid) && pid > 0) preferredSet.add(pid);
    }

    // 3) Backward compatibility: selected_programs can be array or JSON string
    const sp: unknown = (app as any).selected_programs;
    if (Array.isArray(sp)) {
      sp.forEach((id) => {
        const n = Number(id);
        if (!Number.isNaN(n)) preferredSet.add(n);
      });
    } else if (typeof sp === 'string') {
      try {
        const arr = JSON.parse(sp);
        if (Array.isArray(arr)) {
          arr.forEach((id) => {
            const n = Number(id);
            if (!Number.isNaN(n)) preferredSet.add(n);
          });
        }
      } catch {
        // ignore parse errors
      }
    }
  }

  const preferredIds = Array.from(preferredSet);

  // Sort programs: preferred first, then by course/name for stable display
  const sorted = programs.slice().sort((a, b) => {
    const ai = preferredSet.has(Number((a as any).id)) ? 0 : 1;
    const bi = preferredSet.has(Number((b as any).id)) ? 0 : 1;
    if (ai !== bi) return ai - bi;
    const an = String((a as any).course_name || (a as any).name || '');
    const bn = String((b as any).course_name || (b as any).name || '');
    return an.localeCompare(bn);
  });

  return { programs: sorted, preferredIds };
}
