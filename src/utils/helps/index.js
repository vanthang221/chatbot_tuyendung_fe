import { REACT_APP_SERVER_BASE_URL } from "../constants/config";

export const getServerBaseUrl = () => {
  if (!isEmpty(REACT_APP_SERVER_BASE_URL)) {
    return REACT_APP_SERVER_BASE_URL;
  }

  return null;
};

const has = Object.prototype.hasOwnProperty;

export const isEmpty = (prop) => {
  return (
    prop === null ||
    prop === undefined ||
    (has.call(prop, "length") && prop.length === 0) ||
    (prop.constructor === Object && Object.keys(prop).length === 0) ||
    `${prop}`.toLocaleLowerCase() === "null"
  );
};

export const findPageByPath = (currentPath, pages = []) => {
  const catchAllPage = pages.find((page) => page.path === "/*");
  if (catchAllPage) {
    return catchAllPage;
  }

  const page = pages.find((page) => {
    const path = new RegExp(
      "^" + page.path.replace(/:[^/]+/g, "([^/]+)") + "$",
    );
    return path.test(currentPath);
  });

  return page;
};

export const getFullUrlStaticFilePDF = (path) => {
  const server_url = getServerBaseUrl();
  let url = `${path}`
    .replace("_internal\\", "")
    .replace("_internal/", "")
    .replace("server\\", "")
    .replace("server/", "")
    .replace("src\\", "")
    .replace("src/", "");

  if (server_url) {
    url = `${server_url}/${url}`;
  } else {
    url = `${window.location.origin}/${url}`;
  }

  return url;
};

export const getUrlToOff = (path) => {
  let url = getFullUrlStaticFilePDF(path);

  if (isEmpty(REACT_APP_SERVER_BASE_URL)) {
    url = `${window.location.origin}/${url}`;
  }

  return url;
};

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

const CHAT_SESSIONS_STORAGE_KEY = "recruitment_chat_sessions";

export const loadChatSessionsFromStorage = () => {
  try {
    const raw = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const saveChatSessionToStorage = (campaignId, sessionToken) => {
  if (!campaignId || !sessionToken) return;
  const sessions = loadChatSessionsFromStorage();
  sessions[String(campaignId)] = sessionToken;
  localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
};

export const getChatSessionToken = (campaignId) => {
  const sessions = loadChatSessionsFromStorage();
  return sessions[String(campaignId)] || null;
};
