import React, { useEffect, useRef } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import classNames from "classnames/bind";
import { Button, Input } from "antd";
import { Logo, IconMoney } from "../../../../assets/svg/logo";
import CampaignChatPanel from "./CampaignChatPanel";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import styles from "./ChatBotRecruiment.module.sass";
import { findCampaignById } from "../../../../utils/constants/config";
import HeaderChatCta from "../../../../layouts/desktop/Header/HeaderChatCta";

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

const GeneralDetailPanel = ({ onOpenChat }) => (
  <div className={cx("detailPanel")}>
    <div className={cx("detailHeader")}>
      <div className={cx("detailHeaderInfo")}>
        <span className={cx("detailTitle")}>Trợ lý tuyển dụng AI</span>

        <p className={cx("departmentLabel")}>Trò chuyện chung</p>

        <div className={cx("detailMetaBar")}>
          <span className={cx("detailMetaItem")}>
            <em>Chế độ</em> Hỏi đáp chung
          </span>
        </div>
      </div>

      <button type="button" className={cx("applyButton")} onClick={onOpenChat}>
        <span className={cx("applyIcon")}>💬</span>
        Bắt đầu trò chuyện
      </button>
    </div>

    <div className={cx("detailContent")}>
      <DetailSection
        icon="✨"
        title="Hỗ trợ chung"
        values={[
          "Hỏi về quy trình tuyển dụng",
          "Hỏi về hồ sơ, CV và phỏng vấn",
          "Tìm hiểu các vị trí đang tuyển",
        ]}
      />
    </div>
  </div>
);

const ChatTabs = ({
  campaigns,
  openCampaignIds,
  activeCampaignId,
  onActivate,
  onClose,
}) => {
  if (openCampaignIds.length === 0) return null;

  return (
    <div className={cx("chatTabsBar")} aria-label="Các cuộc trò chuyện đã mở">
      <div className={cx("chatTabsList")}>
        {openCampaignIds.map((id) => {
          const tabCampaign = findCampaignById(campaigns, id);
          const isActive = String(id) === String(activeCampaignId);

          return (
            <div key={id} className={cx("chatTab", { active: isActive })}>
              <button
                type="button"
                className={cx("chatTabButton")}
                onClick={() => onActivate(id)}
              >
                <span className={cx("chatTabTitle")}>
                  {tabCampaign?.title || `JD ${id}`}
                </span>
              </button>

              <button
                type="button"
                className={cx("chatTabClose")}
                aria-label={`Đóng tab ${tabCampaign?.title || id}`}
                onClick={() => onClose(id)}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

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
    openChatCampaignIds,
    activeChatCampaignId,
    closeChatCampaign,
    activateChatCampaign,
  } = useRecruitment();

  const campaign = findCampaignById(campaigns, campaignId);
  const prevCampaignIdRef = useRef(campaignId);

  useEffect(() => {
    if (!isCandidateRegistered || !campaignId) {
      prevCampaignIdRef.current = campaignId;
      return;
    }

    const campaignChanged =
      String(prevCampaignIdRef.current) !== String(campaignId);
    prevCampaignIdRef.current = campaignId;

    if (
      campaignChanged &&
      !openChatCampaignIds.includes(String(campaignId))
    ) {
      activateChatCampaign(campaignId);
    }
  }, [
    activateChatCampaign,
    campaignId,
    isCandidateRegistered,
    openChatCampaignIds,
  ]);

  const showChat =
    chatStarted &&
    isCandidateRegistered &&
    (!campaignId || openChatCampaignIds.length > 0);

  const handleOpenChat = () => {
    requestChatAccess(campaignId);
  };

  const handleApply = () => {
    if (!isCandidateRegistered) {
      openCandidateModal(campaignId);

      return;
    }

    requestChatAccess(campaignId);
  };

  const handleSelectCampaign = (id) => {
    if (requestChatAccess(id)) {
      navigate(`/${id}`);
    }
  };

  const handleActivateChatTab = (id) => {
    activateChatCampaign(id);
    navigate(`/${id}`);
  };

  const handleCloseChatTab = (id) => {
    const wasActive = String(id) === String(activeChatCampaignId);
    const nextActiveId = closeChatCampaign(id);

    if (!nextActiveId) {
      activateChatCampaign(null);
      navigate("/chat");
      return;
    }

    if (wasActive) {
      navigate(`/${nextActiveId}`);
    }
  };

  if (!loading && campaignId && !campaign && campaigns.length > 0) {
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
            <>
              <ChatTabs
                campaigns={campaigns}
                openCampaignIds={openChatCampaignIds}
                activeCampaignId={activeChatCampaignId}
                onActivate={handleActivateChatTab}
                onClose={handleCloseChatTab}
              />
              <CampaignChatPanel
                key={activeChatCampaignId ?? campaign?.id ?? "general"}
                campaign={
                  findCampaignById(campaigns, activeChatCampaignId) || campaign
                }
                onApply={handleApply}
                showApplyButton={isCandidateRegistered}
              />
            </>
          ) : !campaign ? (
            <GeneralDetailPanel onOpenChat={handleOpenChat} />
          ) : (
            <DetailPanel campaign={campaign} onApply={handleApply} />
          )}
        </main>
      </div>
    </div>
  );
};

export default CampaignDetailPage;
