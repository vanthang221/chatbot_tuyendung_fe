import React from "react";
import classNames from "classnames/bind";
import { Chatbot } from "../../../assets/svg";
import styles from "../../../../src/pages/desktop/publicDesktop/chatbot-recruiment/ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const HeaderChatCta = ({ onClick }) => (
  <button type="button" className={cx("headerChatGroup")} onClick={onClick}>
    <span className={cx("headerChatBubble")}>
      <span className={cx("headerChatLine")}>Trò chuyện với</span>
      <span className={cx("headerChatLine")}>Trợ lý tuyển dụng</span>
    </span>
    <span className={cx("chatBotAvatar")} aria-hidden="true">
      <Chatbot />
    </span>
  </button>
);

export default HeaderChatCta;
