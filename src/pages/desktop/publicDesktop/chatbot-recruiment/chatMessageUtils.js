const toTextList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean).join("; ");
  return value || "";
};

const getAttachmentFingerprint = (message) => {
  const attachment = message?.attachment || message?.file || null;
  if (!attachment) return "";

  return [
    attachment.id,
    attachment.cv_path ||
      attachment.file_path ||
      attachment.path ||
      attachment.url ||
      attachment.file_url ||
      "",
    attachment.original_name || attachment.name || "",
  ]
    .filter(Boolean)
    .join("|");
};

const getMessageFingerprint = (message) => {
  if (!message || typeof message !== "object") return null;

  if (message.id != null && message.id !== "") {
    return `id:${String(message.id)}`;
  }

  const text = String(message.text ?? message.content ?? "").trim();

  return [
    `from:${message.from || ""}`,
    `type:${message.type || ""}`,
    `text:${text}`,
    `attachment:${getAttachmentFingerprint(message)}`,
  ].join("||");
};

export const mergeChatMessages = (...messageGroups) => {
  const merged = [];
  const indexByFingerprint = new Map();

  messageGroups.flat().forEach((message) => {
    const fingerprint = getMessageFingerprint(message);
    if (!fingerprint) return;

    if (indexByFingerprint.has(fingerprint)) {
      merged[indexByFingerprint.get(fingerprint)] = message;
      return;
    }

    indexByFingerprint.set(fingerprint, merged.length);
    merged.push(message);
  });

  return merged;
};

export const buildCandidatePayload = (candidateInfo) => ({
  fullName: candidateInfo?.fullName?.trim() || "",
  email: candidateInfo?.email?.trim() || "",
  phone: candidateInfo?.phone?.trim() || "",
});

export const buildUserInfoPayload = (candidateInfo) => ({
  phone: candidateInfo?.phone?.trim() || "",
  name: candidateInfo?.fullName?.trim() || "",
  email: candidateInfo?.email?.trim() || "",
});

/** session = {sdt}_{campaignId} */
export const buildRecruitmentSessionKey = (phone, campaignId) => {
  const sdt = String(phone ?? "").trim();
  const cid = String(campaignId ?? "").trim();
  if (!sdt || !cid) return cid || sdt || "";
  return `${sdt}_${cid}`;
};

export const buildJobContextPayload = (campaign, campaignId) =>
  [
    // `campaign_id: ${campaignId || ""}`,
    `title: ${campaign?.title || ""}`,
    `department: ${campaign?.department || ""}`,
    `location: ${campaign?.location || ""}`,
    `quantity: ${campaign?.quantity || ""}`,
    `experience: ${campaign?.experience || ""}`,
    `education: ${campaign?.education || ""}`,
    `salary_range: ${campaign?.salaryRange || ""}`,
    `description: ${toTextList(campaign?.description)}`,
    `requirements: ${toTextList(campaign?.requirements)}`,
    `benefits: ${toTextList(campaign?.benefits)}`,
    `working_time: ${toTextList(campaign?.workingTime)}`,
  ].join("\n");
export const buildChatMessagesForCampaign = (campaign, candidateName) => [
  { id: `jd-${campaign.id}`, type: "jd" },
  {
    id: `welcome-${campaign.id}`,
    from: "bot",
    text: `Xin chào ${candidateName}, mình là trợ lý tuyển dụng AI. Bạn muốn hỏi gì về vị trí ${campaign.title}?`,
  },
];

export const mergeSessionMessagesWithCampaignUi = (
  campaign,
  candidateName,
  apiMessages = [],
  extraMessages = [],
) => {
  const jdMessage = { id: `jd-${campaign.id}`, type: "jd" };
  const history = Array.isArray(apiMessages) ? apiMessages : [];
  const extras = Array.isArray(extraMessages) ? extraMessages : [];

  let base;
  if (history.length === 0) {
    base = buildChatMessagesForCampaign(campaign, candidateName);
  } else {
    base = [jdMessage, ...history];
  }

  if (extras.length === 0) return base;

  return mergeChatMessages(base, extras);
};
