export const buildCandidatePayload = (candidateInfo) => ({
  fullName: candidateInfo?.fullName?.trim() || "",
  email: candidateInfo?.email?.trim() || "",
  phone: candidateInfo?.phone?.trim() || "",
});

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
  const jdMessage = { id: `jd-${campaign.id}`, type: "jd" };
  const history = Array.isArray(apiMessages) ? apiMessages : [];

  if (history.length === 0) {
    return buildChatMessagesForCampaign(campaign, candidateName);
  }

  return [jdMessage, ...history];
};
