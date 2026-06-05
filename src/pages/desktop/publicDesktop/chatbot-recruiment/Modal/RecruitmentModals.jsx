import React from "react";
import { useParams } from "react-router-dom";
import { useRecruitment } from "../../../../../context/RecruitmentContext";
import CandidateInfoModal from "../CandidateInfoModal";
import { findCampaignById } from "../../../../../utils/constants/config";

const RecruitmentModals = () => {
  const { campaignId } = useParams();
  const {
    campaigns,
    candidateModalOpen,
    closeCandidateModal,
    modalCampaignId,
  } = useRecruitment();

  const activeId = modalCampaignId || campaignId;
  const campaign = findCampaignById(campaigns, activeId);
  const targetPath = activeId ? `/${activeId}` : "/chat";

  return (
    <CandidateInfoModal
      open={candidateModalOpen}
      onClose={closeCandidateModal}
      campaignTitle={campaign?.title || ""}
      targetPath={targetPath}
    />
  );
};

export default RecruitmentModals;
