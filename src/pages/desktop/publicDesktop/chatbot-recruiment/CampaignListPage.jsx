import React from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import { Button, Col, Input, Radio, Row, Tooltip } from "antd";
import { IconMoney, Logo } from "../../../../assets/svg/logo";
import HeaderChatCta from "./HeaderChatCta";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import {
  EDUCATION_OPTIONS,
  EXPERIENCE_OPTIONS,
  SALARY_OPTIONS,
} from "./campaignUtils";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const PageHeader = () => {
  const navigate = useNavigate();
  const {
    searchInput,
    setSearchInput,
    handleSearch,
    campaigns,
    requestChatAccess,
    isCandidateRegistered,
  } = useRecruitment();

  const handleOpenChat = () => {
    requestChatAccess(campaigns[0]?.id);
  };

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
        {!isCandidateRegistered && (
          <HeaderChatCta onClick={handleOpenChat} />
        )}
        <div className={cx("headerSearch")}>
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm vị trí"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ width: "400px" }}
          />
          <Button type="primary" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </div>
      </div>
    </header>
  );
};

const FilterSidebar = () => {
  const {
    experienceFilter,
    setExperienceFilter,
    salaryFilter,
    setSalaryFilter,
    educationFilter,
    setEducationFilter,
  } = useRecruitment();

  return (
    <aside className={cx("filterSidebar")}>
      <div className={cx("filterGroup")}>
        <h3>Kinh nghiệm</h3>
        <Radio.Group
          className={cx("filterOptions")}
          value={experienceFilter}
          onChange={(e) => setExperienceFilter(e.target.value)}
        >
          {EXPERIENCE_OPTIONS.map((option) => (
            <Radio
              key={String(option.value)}
              value={option.value}
              className={cx("filterOption")}
            >
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </div>
      <div className={cx("filterDivider")} />
      <div className={cx("filterGroup")}>
        <h3>Mức lương</h3>
        <Radio.Group
          className={cx("filterOptions")}
          value={salaryFilter}
          onChange={(e) => setSalaryFilter(e.target.value)}
        >
          {SALARY_OPTIONS.map((option) => (
            <Radio key={option} value={option} className={cx("filterOption")}>
              {option}
            </Radio>
          ))}
        </Radio.Group>
      </div>
      <div className={cx("filterDivider")} />
      <div className={cx("filterGroup")}>
        <h3>Trình độ học vấn</h3>
        <Radio.Group
          className={cx("filterOptions")}
          value={educationFilter}
          onChange={(e) => setEducationFilter(e.target.value)}
        >
          {EDUCATION_OPTIONS.map((option) => (
            <Radio
              key={String(option.value)}
              value={option.value}
              className={cx("filterOption")}
            >
              {option.label}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    </aside>
  );
};

const LIST_META_FIELDS = [
  // { label: "Địa điểm", key: "location" },
  { label: "Số lượng cần tuyển", key: "quantity" },
  { label: "Kinh nghiệm", key: "experience" },
  { label: "Trình độ học vấn", key: "education" },
];

const ListJobCard = ({ campaign, onClick }) => (
  <div type="text" block className={cx("listJobCard")} onClick={onClick}>
    <div className={cx("listJobCardBody")}>
      <h3>{campaign.title}</h3>
      <p className={cx("departmentLabel")}>{campaign.department}</p>
      <Row className={cx("inlineMeta")} gutter={[12, 8]}>
        {LIST_META_FIELDS.map((field) => {
          const value = campaign[field.key] ?? "";
          const tooltipTitle = `${field.label}: ${value}`;

          return (
            <Col key={field.key} xs={24} md={6} className={cx("metaCol")}>
              <Tooltip title={tooltipTitle} placement="top">
                <div className={cx("metaCell")}>
                  <span className={cx("metaLabel")}>{field.label}</span>
                  <strong className={cx("metaValue")}>{value}</strong>
                </div>
              </Tooltip>
            </Col>
          );
        })}
      </Row>
    </div>
    <div className={cx("salaryBadgeGreen")}>
      <IconMoney />
      {campaign.salaryRange}
    </div>
  </div>
);

const CampaignListPage = () => {
  const navigate = useNavigate();
  const { campaigns, loading } = useRecruitment();

  return (
    <>
      <PageHeader />
      <div className={cx("listBody")}>
        <FilterSidebar />
        <main className={cx("listMain")}>
          {loading ? (
            <div className={cx("emptyList")}>
              <p>Đang tải danh sách vị trí...</p>
            </div>
          ) : campaigns.length > 0 ? (
            campaigns.map((item) => (
              <ListJobCard
                key={item.id}
                campaign={item}
                onClick={() => navigate(`/${item.id}`)}
              />
            ))
          ) : (
            <div className={cx("emptyList")}>
              <p>Không tìm thấy vị trí phù hợp với bộ lọc.</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CampaignListPage;
