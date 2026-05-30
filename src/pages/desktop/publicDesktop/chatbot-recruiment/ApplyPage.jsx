import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import classNames from "classnames/bind";
import { Logo } from "../../../../assets/svg/logo";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import { findCampaignById } from "./campaignUtils";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const SidebarJobCard = ({ campaign, active, onClick }) => (
  <button type="button" className={cx("sidebarJobCard", { active })} onClick={onClick}>
    <div className={cx("sidebarJobHead")}>
      <h3>{campaign.title}</h3>
      <span
        className={cx("status", {
          expiring: campaign.status !== "Đang tuyển",
        })}
      >
        {campaign.status === "Đang tuyển" ? "Đang tuyển" : "Sắp hết hạn"}
      </span>
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
      <span>Hạn tuyển dụng</span>
      <strong>{campaign.deadline}</strong>
    </div>
  </button>
);

const ApplySidebar = ({ selectedId, onSelectCampaign }) => {
  const { campaigns, searchInput, setSearchInput, setSearchName } = useRecruitment();

  return (
    <aside className={cx("applySidebar")}>
      <div className={cx("applySidebarHeader")}>
        <div className={cx("logoBox")}>
          <Logo />
        </div>
        <div className={cx("sidebarHeader")}>
          <p className={cx("subTitle")}>Trợ lý tuyển dụng AI</p>
          <p className={cx("sidebarDesc")}>
            Tư vấn vị trí phù hợp và hỗ trợ tuyển dụng nhanh
          </p>
        </div>
      </div>
      <div className={cx("sidebarDivider")} />
      <h2 className={cx("sidebarSectionTitle")}>Vị trí đang tuyển</h2>
      <div className={cx("searchBox")}>
        <span className={cx("searchIcon")}>🔍</span>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm kiếm vị trí"
          onKeyDown={(e) => e.key === "Enter" && setSearchName(searchInput)}
        />
      </div>
      <div className={cx("campaignList")}>
        {campaigns.map((item) => (
          <SidebarJobCard
            key={item.id}
            campaign={item}
            active={String(selectedId) === String(item.id)}
            onClick={() => onSelectCampaign(item.id)}
          />
        ))}
      </div>
    </aside>
  );
};

const ApplyPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns, candidateInfo, setCandidateInfo, setMessages } = useRecruitment();
  const campaign = findCampaignById(campaigns, campaignId);

  if (!campaign && campaigns.length > 0) {
    return <Navigate to="/" replace />;
  }

  if (!campaign) {
    return null;
  }

  const isValid =
    candidateInfo.fullName &&
    candidateInfo.email &&
    candidateInfo.phone &&
    candidateInfo.consent;

  const handleStartChat = () => {
    setMessages([
      {
        id: Date.now(),
        from: "bot",
        text: `Xin chào ${candidateInfo.fullName || "bạn"}, mình là trợ lý tuyển dụng AI. Bạn muốn hỏi gì về vị trí ${campaign.title}?`,
      },
    ]);
    navigate(`/${campaignId}/chat`);
  };

  return (
    <div className={cx("applyBody")}>
      <ApplySidebar
        selectedId={campaignId}
        onSelectCampaign={(id) => navigate(`/${id}/apply`)}
      />
      <main className={cx("applyContent")}>
        <div className={cx("registerPanel")}>
          <p className={cx("welcomeText")}>Chào mừng bạn đến với</p>
          <h1>Trợ lý tuyển dụng AI</h1>
          <p className={cx("guideText")}>
            Tư vấn vị trí phù hợp và hỗ trợ tuyển dụng nhanh chóng
          </p>
          <p className={cx("formHint")}>
            Vui lòng điền thông tin để bắt đầu trò chuyện với trợ lý ảo tuyển dụng
          </p>
          <label>
            <span>
              Họ và tên <em>*</em>
            </span>
            <input
              value={candidateInfo.fullName}
              onChange={(e) =>
                setCandidateInfo((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Họ và tên"
            />
          </label>
          <label>
            <span>
              Email <em>*</em>
            </span>
            <input
              type="email"
              value={candidateInfo.email}
              onChange={(e) =>
                setCandidateInfo((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="Email"
            />
          </label>
          <label>
            <span>
              Số điện thoại <em>*</em>
            </span>
            <input
              value={candidateInfo.phone}
              onChange={(e) =>
                setCandidateInfo((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Số điện thoại"
            />
          </label>
          <label className={cx("checkboxLabel")}>
            <input
              type="checkbox"
              checked={candidateInfo.consent}
              onChange={(e) =>
                setCandidateInfo((prev) => ({ ...prev, consent: e.target.checked }))
              }
            />
            Tôi đồng ý cho công ty lưu trữ thông tin để hỗ trợ tuyển dụng
          </label>
          <button
            type="button"
            className={cx("startButton")}
            onClick={handleStartChat}
            disabled={!isValid}
          >
            Bắt đầu trò chuyện
          </button>
        </div>
      </main>
    </div>
  );
};

export default ApplyPage;
