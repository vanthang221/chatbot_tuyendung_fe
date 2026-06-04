const EXTRA_MESSAGES_STORAGE_KEY = "recruitment_chat_extra_messages";

const loadAll = () => {
  try {
    const raw = localStorage.getItem(EXTRA_MESSAGES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const saveAll = (data) => {
  try {
    localStorage.setItem(EXTRA_MESSAGES_STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

export const getExtraMessagesStorageKey = (campaignId, candidateEmail = "") =>
  `${String(campaignId)}:${String(candidateEmail).trim().toLowerCase()}`;

export const loadExtraMessages = (campaignId, candidateEmail) => {
  const key = getExtraMessagesStorageKey(campaignId, candidateEmail);
  const all = loadAll();
  const list = all[key];
  return Array.isArray(list) ? list : [];
};

export const appendExtraMessages = (
  campaignId,
  candidateEmail,
  newMessages,
) => {
  if (!campaignId || !Array.isArray(newMessages) || newMessages.length === 0) {
    return;
  }

  const key = getExtraMessagesStorageKey(campaignId, candidateEmail);
  const all = loadAll();
  const existing = Array.isArray(all[key]) ? all[key] : [];
  const byId = new Map(existing.map((item) => [item.id, item]));

  newMessages.forEach((item) => {
    if (!item?.id) return;
    byId.set(item.id, item);
  });

  all[key] = Array.from(byId.values());
  saveAll(all);
};
