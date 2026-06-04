import React from "react";
import classNames from "classnames/bind";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const ChatMarkdownContent = ({ content }) => {
  if (!content) return null;

  return (
    <div className={cx("markdownContent")}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
};

export default ChatMarkdownContent;
