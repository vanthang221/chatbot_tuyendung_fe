import CampaignListPage from "./desktop/publicDesktop/chatbot-recruiment/CampaignListPage";
import CampaignDetailPage from "./desktop/publicDesktop/chatbot-recruiment/CampaignDetailPage";
import ApplyPage from "./desktop/publicDesktop/chatbot-recruiment/ApplyPage";
import ChatBotRecruimentMB from "./mobile/chatbot-recruiment";
import ChatPage from "../layouts/desktop/ChatPage";

const pages = [
  {
    name: "campaign-list",
    path: "/",
    auth: false,
    label: "Trợ lý AI",
    elementDesktop: <CampaignListPage />,
    elementMobile: <ChatBotRecruimentMB />,
  },
  {
    name: "campaign-detail",
    path: "/:campaignId",
    auth: false,
    label: "Chi tiết chiến dịch",
    elementDesktop: <CampaignDetailPage />,
    elementMobile: <ChatBotRecruimentMB />,
  },
  {
    name: "campaign-chat-general",
    path: "/chat",
    auth: false,
    label: "Trò chuyện chung",
    elementDesktop: <ChatPage />,
    elementMobile: <ChatBotRecruimentMB />,
  },
  {
    name: "campaign-apply",
    path: "/:campaignId/apply",
    auth: false,
    label: "Ứng tuyển",
    elementDesktop: <ApplyPage />,
    elementMobile: <ChatBotRecruimentMB />,
  },
  {
    name: "campaign-chat",
    path: "/:campaignId/chat",
    auth: false,
    label: "Trò chuyện",
    elementDesktop: <ChatPage />,
    elementMobile: <ChatBotRecruimentMB />,
  },
];

export default pages;
