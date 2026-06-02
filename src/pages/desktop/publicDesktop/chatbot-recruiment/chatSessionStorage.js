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
