import api from "../../../../utils/service/api";

export const actionGetRecruiment = (params) => {
  return api({
    method: "GET",
    url: `/api/recruitment/campaigns`,
    params,
  });
};

export const actionEnsureRecruitmentChatSession = (data) => {
  return api({
    method: "POST",
    url: `/api/recruitment/chat/sessions`,
    data,
  });
};

export const actionSendRecruitmentChatMessage = (data) => {
  return api({
    method: "POST",
    url: `/api/recruitment/chat/messages`,
    data,
  });
};

export const actionUploadRecruitmentFile = (formData) => {
  return api({
    method: "POST",
    url: `/api/recruitment/files/upload`,
    data: formData,
  });
};
