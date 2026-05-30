import React from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import { Logo } from "../../../../assets/svg/logo";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import { EXPERIENCE_OPTIONS, SALARY_OPTIONS } from "./campaignUtils";
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

const FilterSidebar = () => {
  const { experienceFilter, setExperienceFilter, salaryFilter, setSalaryFilter } =
    useRecruitment();

  return (
    <aside className={cx("filterSidebar")}>
      <div className={cx("filterGroup")}>
        <h3>Kinh nghiệm</h3>
        <div className={cx("filterOptions")}>
          {EXPERIENCE_OPTIONS.map((option) => (
            <label key={option} className={cx("filterOption")}>
              <input
                type="radio"
                name="experience"
                checked={experienceFilter === option}
                onChange={() => setExperienceFilter(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
      <div className={cx("filterDivider")} />
      <div className={cx("filterGroup")}>
        <h3>Mức lương</h3>
        <div className={cx("filterOptions")}>
          {SALARY_OPTIONS.map((option) => (
            <label key={option} className={cx("filterOption")}>
              <input
                type="radio"
                name="salary"
                checked={salaryFilter === option}
                onChange={() => setSalaryFilter(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

const ListJobCard = ({ campaign, onClick }) => (
  <button type="button" className={cx("listJobCard")} onClick={onClick}>
    <div className={cx("listJobCardBody")}>
      <h3>{campaign.title}</h3>
      <p className={cx("departmentLabel")}>{campaign.department}</p>
      <div className={cx("inlineMeta")}>
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
    <div className={cx("salaryBadgeGreen")}>
      <span className={cx("salaryIcon")}>💰</span>
      {campaign.salaryRange}
    </div>
  </button>
);

const CampaignListPage = () => {
  const navigate = useNavigate();
  const { filteredCampaigns } = useRecruitment();

  return (
    <>
      <PageHeader />
      <div className={cx("listBody")}>
        <FilterSidebar />
        <main className={cx("listMain")}>
          {filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((item) => (
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
