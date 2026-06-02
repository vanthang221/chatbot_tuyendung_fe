import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import classNames from "classnames/bind";
import { Button, Input } from "antd";
import { Logo, IconMoney } from "../../../../assets/svg/logo";
import HeaderChatCta from "./HeaderChatCta";
import CampaignChatPanel from "./CampaignChatPanel";
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

const SIDEBAR_META_FIELDS = [
  { label: "Địa điểm", key: "location" },
  { label: "Số lượng cần tuyển", key: "quantity" },
  { label: "Kinh nghiệm", key: "experience" },
  { label: "Trình độ học vấn", key: "education" },
];

const SidebarJobCard = ({ campaign, active, onClick }) => (
  <button
    type="button"
    className={cx("sidebarJobCard", { active })}
    onClick={onClick}
  >
    <h3 className={cx("sidebarJobTitle")}>{campaign.title}</h3>
    <p className={cx("sidebarDepartment")}>{campaign.department}</p>

    <div className={cx("sidebarMetaList")}>
      {SIDEBAR_META_FIELDS.map((field) => (
        <div key={field.key} className={cx("sidebarMetaLine")}>
          <span>{field.label}</span>
          <strong>{campaign[field.key] ?? "—"}</strong>
        </div>
      ))}
    </div>

    <div className={cx("salaryBadgeGreen", "sidebarSalaryBadge")}>
      <IconMoney />
      <span>{campaign.salaryRange}</span>
    </div>
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
        <span className={cx("detailTitle")}>{campaign.title}</span>

        <p className={cx("departmentLabel")}>{campaign.department}</p>

        <div className={cx("detailMetaBar")}>
          <span className={cx("detailMetaItem")}>
            <em>Số lượng cần tuyển</em> {campaign.quantity}
          </span>

          <span className={cx("metaDivider")} aria-hidden="true">
            |
          </span>

          <span className={cx("detailMetaItem")}>
            <em>Kinh nghiệm</em> {campaign.experience}
          </span>

          <span className={cx("metaDivider")} aria-hidden="true">
            |
          </span>

          <span className={cx("detailMetaItem")}>
            <em>Học vấn</em> {campaign.education}
          </span>
        </div>
      </div>

      <button type="button" className={cx("applyButton")} onClick={onApply}>
        <span className={cx("applyIcon")}>📄</span>
        Ứng tuyển ngay
      </button>
    </div>

    <div className={cx("detailContent")}>
      <DetailSection
        icon="💼"
        title="Mô tả công việc"
        values={campaign.description}
      />

      <DetailSection
        icon="📋"
        title="Yêu cầu ứng viên"
        values={campaign.requirements}
      />

      <DetailSection icon="🎁" title="Quyền lợi" values={campaign.benefits} />

      <DetailSection
        icon="🕐"
        title="Thời gian làm việc"
        values={campaign.workingTime}
      />
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
  } = useRecruitment();

  const campaign = findCampaignById(campaigns, campaignId);

  const showChat = chatStarted && isCandidateRegistered;

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

        <main
          className={cx("content", "detailMain", "workspaceMain", {
            workspaceMainChat: showChat,
          })}
        >
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
