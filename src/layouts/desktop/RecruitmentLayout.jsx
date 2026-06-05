import { Layout } from "antd";
import React from "react";
import classNames from "classnames/bind";
import styles from "../../pages/desktop/publicDesktop/chatbot-recruiment/ChatBotRecruiment.module.sass";
import RecruitmentModals from "../../pages/desktop/publicDesktop/chatbot-recruiment/Modal/RecruitmentModals";

const cx = classNames.bind(styles);

const RecruitmentLayout = ({ children }) => (
  <Layout className={`common-layout ${cx("pageLayout")}`}>
    <div className={cx("wrapper")}>
      {children}
      <RecruitmentModals />
    </div>
  </Layout>
);

export default RecruitmentLayout;
