const CANDIDATE_STORAGE_KEY = "recruitment_candidate_info";

const DEFAULT_CANDIDATE = {
  fullName: "",
  email: "",
  phone: "",
  consent: false,
};

export const loadCandidateFromStorage = () => {
  try {
    const raw = localStorage.getItem(CANDIDATE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CANDIDATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_CANDIDATE, ...parsed };
  } catch {
    return { ...DEFAULT_CANDIDATE };
  }
};

export const saveCandidateToStorage = (info) => {
  localStorage.setItem(CANDIDATE_STORAGE_KEY, JSON.stringify(info));
};

export const hasCandidateInfo = (info) =>
  Boolean(
    info?.fullName?.trim() &&
    info?.email?.trim() &&
    info?.phone?.trim() &&
    info?.consent,
  );
