import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import CampaignDetailPage from "./CampaignDetailPage";
import { useRecruitment } from "../../../../context/RecruitmentContext";

/** Giữ URL /apply nhưng hiển thị trang chi tiết + mở modal, không redirect */
const ApplyPage = () => {
  const { campaignId } = useParams();
  const { openCandidateModal, isCandidateRegistered } = useRecruitment();

  useEffect(() => {
    if (!isCandidateRegistered) {
      openCandidateModal(campaignId);
    }
  }, [campaignId, isCandidateRegistered, openCandidateModal]);

  return <CampaignDetailPage />;
};

export default ApplyPage;
