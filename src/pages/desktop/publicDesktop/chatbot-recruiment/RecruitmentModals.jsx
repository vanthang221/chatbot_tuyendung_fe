import React from "react";
import { useParams } from "react-router-dom";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import { findCampaignById } from "./campaignUtils";
import CandidateInfoModal from "./CandidateInfoModal";

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

  return (
    <CandidateInfoModal
      open={candidateModalOpen}
      onClose={closeCandidateModal}
      campaignTitle={campaign?.title || ""}
    />
  );
};

export default RecruitmentModals;
