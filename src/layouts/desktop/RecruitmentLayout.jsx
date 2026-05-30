import { Layout } from "antd";
import React from "react";
import classNames from "classnames/bind";
import styles from "../../pages/desktop/publicDesktop/chatbot-recruiment/ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const RecruitmentLayout = ({ children }) => (
  <Layout className={`common-layout ${cx("pageLayout")}`}>
    <div className={cx("wrapper")}>{children}</div>
  </Layout>
);

export default RecruitmentLayout;
