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
  if (!sdt && !cid) return "";
  if (!cid) return sdt ? `${sdt}_2002` : "2002";
  return `${sdt}_${cid}`;
};

export const buildJobContextPayload = (campaign) =>
  !campaign
    ? ""
    : [
        // `campaign_id: ${campaign?.id || ""}`,
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

export const buildGeneralChatMessages = (candidateName) => [
  {
    id: "welcome-general",
    from: "bot",
    text: `Xin chào ${candidateName || "bạn"}, mình có thể hỗ trợ các câu hỏi chung về tuyển dụng, CV, phỏng vấn và quy trình ứng tuyển.`,
  },
];
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
) => {
  const history = Array.isArray(apiMessages) ? apiMessages : [];

  if (!campaign) {
    if (history.length === 0) {
      return buildGeneralChatMessages(candidateName);
    }

    return history;
  }

  const jdMessage = { id: `jd-${campaign.id}`, type: "jd" };

  if (history.length === 0) {
    return buildChatMessagesForCampaign(campaign, candidateName);
  }

  return [jdMessage, ...history];
};
