import React, { useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import classNames from "classnames/bind";
import { Button, Input } from "antd";
import { Logo } from "../../../../assets/svg/logo";
import HeaderChatCta from "./HeaderChatCta";
import CampaignChatPanel, { buildChatMessagesForCampaign } from "./CampaignChatPanel";
import { useRecruitment } from "../../../../context/RecruitmentContext";

import { findCampaignById } from "./campaignUtils";

import styles from "./ChatBotRecruiment.module.sass";



const cx = classNames.bind(styles);



const PageHeader = ({ onOpenChat }) => {
  const navigate = useNavigate();
  const { searchInput, setSearchInput, handleSearch, isCandidateRegistered } =
    useRecruitment();

  return (
    <header className={cx("pageHeader")}>
      <div className={cx("headerBrand")} onClick={() => navigate("/")}>
        <div className={cx("logoBox")}>
          <Logo />
        </div>
        <div className={cx("headerTitle")}>
          <h1>Trợ lý tuyển dụng AI</h1>
          <p>Tư vấn vị trí phù hợp và hỗ trợ tuyển nhanh</p>
        </div>
      </div>
      <div className={cx("headerActions")}>
        {!isCandidateRegistered && <HeaderChatCta onClick={onOpenChat} />}
        <div className={cx("headerSearch")}>

          <Input

            value={searchInput}

            onChange={(e) => setSearchInput(e.target.value)}

            placeholder="Tìm kiếm vị trí"

            onKeyDown={(e) => e.key === "Enter" && handleSearch()}

          />

          <Button type="primary" onClick={handleSearch}>

            Tìm kiếm

          </Button>

        </div>

      </div>

    </header>

  );

};



const SidebarJobCard = ({ campaign, active, onClick }) => (

  <button type="button" className={cx("sidebarJobCard", { active })} onClick={onClick}>

    <div className={cx("sidebarJobHead")}>

      <h3>{campaign.title}</h3>

    </div>

    <p className={cx("departmentLabel")}>{campaign.department}</p>

    <div className={cx("metaLine")}>

      <span>Địa điểm</span>

      <strong>{campaign.location}</strong>

    </div>

    <div className={cx("metaLine")}>

      <span>Số lượng cần tuyển</span>

      <strong>{campaign.quantity}</strong>

    </div>

    <div className={cx("metaLine")}>

      <span>Kinh nghiệm</span>

      <strong>{campaign.experience}</strong>

    </div>

    <div className={cx("salaryBadgeBlue")}>{campaign.salaryRange}</div>

  </button>

);



const DetailSection = ({ icon, title, values }) => (

  <div className={cx("detailSection")}>

    <h3>

      <span className={cx("sectionIcon")}>{icon}</span>

      {title}

    </h3>

    <ul>

      {values.map((item, index) => (

        <li key={`${title}-${index}`}>{item}</li>

      ))}

    </ul>

  </div>

);



const DetailPanel = ({ campaign, onApply }) => (

  <div className={cx("detailPanel")}>

    <div className={cx("detailHeader")}>

      <div className={cx("detailHeaderInfo")}>

        <h1>{campaign.title}</h1>

        <p className={cx("departmentLabel")}>{campaign.department}</p>

        <div className={cx("detailMetaBar")}>

          <span>

            <em>Địa điểm</em> {campaign.location}

          </span>

          <span className={cx("metaDivider")}>|</span>

          <span>

            <em>Số lượng cần tuyển</em> {campaign.quantity}

          </span>

          <span className={cx("metaDivider")}>|</span>

          <span>

            <em>Kinh nghiệm</em> {campaign.experience}

          </span>

        </div>

      </div>

      <button type="button" className={cx("applyButton")} onClick={onApply}>

        <span className={cx("applyIcon")}>📄</span>

        Ứng tuyển ngay

      </button>

    </div>

    <div className={cx("detailContent")}>

      <DetailSection icon="💼" title="Mô tả công việc" values={campaign.description} />

      <DetailSection icon="📋" title="Yêu cầu ứng viên" values={campaign.requirements} />

      <DetailSection icon="🎁" title="Quyền lợi" values={campaign.benefits} />

      <DetailSection icon="🕐" title="Thời gian làm việc" values={campaign.workingTime} />

    </div>

  </div>

);



const CampaignDetailPage = () => {

  const { campaignId } = useParams();

  const navigate = useNavigate();

  const {

    campaigns,

    loading,

    chatStarted,

    isCandidateRegistered,

    openCandidateModal,

    requestChatAccess,

    setChatStarted,

    setMessages,

    candidateInfo,

  } = useRecruitment();



  const campaign = findCampaignById(campaigns, campaignId);

  const showChat = chatStarted && isCandidateRegistered;



  useEffect(() => {

    if (!showChat || !campaign) return;

    setMessages(buildChatMessagesForCampaign(campaign, candidateInfo.fullName));

  }, [campaignId, showChat, campaign, candidateInfo.fullName, setMessages]);



  const handleOpenChat = () => {

    if (!requestChatAccess(campaignId)) return;

    setChatStarted(true);

  };



  const handleApply = () => {

    if (!isCandidateRegistered) {

      openCandidateModal(campaignId);

      return;

    }

    setChatStarted(true);

  };



  const handleSelectCampaign = (id) => {

    navigate(`/${id}`);

  };



  if (!loading && !campaign && campaigns.length > 0) {

    return <Navigate to={`/${campaigns[0].id}`} replace />;

  }



  if (loading) {

    return (

      <>

        <PageHeader onOpenChat={handleOpenChat} />

        <div className={cx("emptyList")}>

          <p>Đang tải thông tin vị trí...</p>

        </div>

      </>

    );

  }



  if (!campaign) {

    return (

      <>

        <PageHeader onOpenChat={handleOpenChat} />

        <div className={cx("emptyList")}>

          <p>Không tìm thấy vị trí phù hợp.</p>

        </div>

      </>

    );

  }



  return (

    <div className={cx("detailPage")}>

      <PageHeader onOpenChat={handleOpenChat} />



      <div className={cx("splitBody", { splitBodyChat: showChat })}>

        <aside className={cx("detailSidebar")}>

          <div className={cx("campaignList")}>

            {campaigns.map((item) => (

              <SidebarJobCard

                key={item.id}

                campaign={item}

                active={String(item.id) === String(campaignId)}

                onClick={() => handleSelectCampaign(item.id)}

              />

            ))}

          </div>

        </aside>



        <main className={cx("content", "detailMain", "workspaceMain", { workspaceMainChat: showChat })}>

          {showChat ? (

            <CampaignChatPanel

              campaign={campaign}

              onApply={handleApply}

              showApplyButton={isCandidateRegistered}

            />

          ) : (

            <DetailPanel campaign={campaign} onApply={handleApply} />

          )}

        </main>

      </div>

    </div>

  );

};



export default CampaignDetailPage;

