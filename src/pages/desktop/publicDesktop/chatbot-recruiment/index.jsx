import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { RecruitmentProvider } from "../../../../context/RecruitmentContext";
import RecruitmentLayout from "../../../../layouts/desktop/RecruitmentLayout";
import CampaignListPage from "./CampaignListPage";
import CampaignDetailPage from "./CampaignDetailPage";
import ApplyPage from "./ApplyPage";
import ChatPage from "./ChatPage";

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
