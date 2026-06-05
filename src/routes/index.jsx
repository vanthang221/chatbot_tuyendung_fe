import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { RecruitmentProvider } from "../context/RecruitmentContext";
import RecruitmentLayout from "../layouts/desktop/RecruitmentLayout";
import CampaignListPage from "../pages/desktop/publicDesktop/chatbot-recruiment/CampaignListPage";
import CampaignDetailPage from "../pages/desktop/publicDesktop/chatbot-recruiment/CampaignDetailPage";
import ApplyPage from "../pages/desktop/publicDesktop/chatbot-recruiment/ApplyPage";
import ChatPage from "../layouts/desktop/ChatPage";

const ChatBotRecruiment = () => (
  <RecruitmentProvider>
    <Routes>
      <Route
        element={
          <RecruitmentLayout>
            <Outlet />
          </RecruitmentLayout>
        }
      >
        <Route index element={<CampaignListPage />} />
        <Route path="chat" element={<CampaignDetailPage />} />
        <Route path=":campaignId" element={<CampaignDetailPage />} />
        <Route path=":campaignId/apply" element={<ApplyPage />} />
        <Route path=":campaignId/chat" element={<ChatPage />} />
      </Route>
    </Routes>
  </RecruitmentProvider>
);

export default ChatBotRecruiment;
