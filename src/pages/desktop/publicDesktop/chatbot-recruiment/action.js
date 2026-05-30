import api from "../../../../utils/service/api";

export const actionGetRecruiment = (params) => {
  return api({
    method: "GET",
    url: `/api/recruitment/campaigns`,
    params,
  });
};
