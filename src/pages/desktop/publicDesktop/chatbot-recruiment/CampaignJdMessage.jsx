import React, { forwardRef } from "react";
import classNames from "classnames/bind";
import { Chatbot } from "../../../../assets/svg";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const JdSection = ({ icon, title, values }) => (
  <div className={cx("jdSection")}>
    <h4>
      <span className={cx("jdSectionIcon")}>{icon}</span>
      {title}
    </h4>
    <ul>
      {values.map((item, index) => (
        <li key={`${title}-${index}`}>{item}</li>
      ))}
    </ul>
  </div>
);

const CampaignJdMessage = forwardRef(({ campaign, onApply, showApplyButton }, ref) => (
  <div ref={ref} className={cx("messageRow", "bot", "jdMessageRow")}>
    <div className={cx("jdMessageAvatar")} aria-hidden="true">
      <Chatbot />
    </div>
    <div className={cx("jdMessageCard")}>
      <div className={cx("jdMessageHead")}>
        <h3>{campaign.title}</h3>
        <p>{campaign.department}</p>
      </div>
      <div className={cx("jdMessageBody")}>
        <JdSection icon="💼" title="Mô tả công việc" values={campaign.description} />
        <JdSection icon="📋" title="Yêu cầu ứng viên" values={campaign.requirements} />
        <JdSection icon="🎁" title="Quyền lợi" values={campaign.benefits} />
        <JdSection icon="🕐" title="Thời gian làm việc" values={campaign.workingTime} />
      </div>
      {showApplyButton && (
        <button type="button" className={cx("applyButton", "jdApplyButton")} onClick={onApply}>
          <span className={cx("applyIcon")}>📄</span>
          Ứng tuyển ngay
        </button>
      )}
    </div>
  </div>
));

CampaignJdMessage.displayName = "CampaignJdMessage";

export default CampaignJdMessage;
