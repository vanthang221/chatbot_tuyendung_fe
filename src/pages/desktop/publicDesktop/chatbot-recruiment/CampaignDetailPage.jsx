import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import classNames from "classnames/bind";
import { Logo } from "../../../../assets/svg/logo";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import { findCampaignById } from "./campaignUtils";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const PageHeader = () => {
  const { searchInput, setSearchInput, handleSearch } = useRecruitment();

  return (
    <header className={cx("pageHeader")}>
      <div className={cx("headerBrand")}>
        <div className={cx("logoBox")}>
          <Logo />
        </div>
        <div className={cx("headerTitle")}>
          <h1>Trợ lý tuyển dụng AI</h1>
          <p>Tư vấn vị trí phù hợp và hỗ trợ tuyển nhanh</p>
        </div>
      </div>
      <div className={cx("headerSearch")}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Tìm kiếm vị trí"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button type="button" onClick={handleSearch}>
          Tìm kiếm
        </button>
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
      <div>
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
  const { campaigns } = useRecruitment();
  const campaign = findCampaignById(campaigns, campaignId);

  if (!campaign && campaigns.length > 0) {
    return <Navigate to="/" replace />;
  }

  if (!campaign) {
    return null;
  }

  return (
    <>
      <PageHeader />
      <div className={cx("splitBody")}>
        <aside className={cx("detailSidebar")}>
          <div className={cx("campaignList")}>
            {campaigns.map((item) => (
              <SidebarJobCard
                key={item.id}
                campaign={item}
                active={String(item.id) === String(campaignId)}
                onClick={() => navigate(`/${item.id}`)}
              />
            ))}
          </div>
        </aside>
        <main className={cx("content")}>
          <DetailPanel
            campaign={campaign}
            onApply={() => navigate(`/${campaignId}/apply`)}
          />
        </main>
      </div>
    </>
  );
};

export default CampaignDetailPage;
