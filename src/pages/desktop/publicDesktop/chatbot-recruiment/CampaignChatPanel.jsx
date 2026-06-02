import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import { Chatbot } from "../../../../assets/svg";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import CampaignJdMessage from "./CampaignJdMessage";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const CampaignChatPanel = ({ campaign, onApply, showApplyButton }) => {
  const { messages, setMessages } = useRecruitment();
  const [messageInput, setMessageInput] = useState("");
  const [jdPinned, setJdPinned] = useState(false);
  const scrollRef = useRef(null);
  const jdRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToLatest = (behavior = "smooth") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  };

  const hasUserMessages = messages.some((message) => message.from === "user");

  useEffect(() => {
    if (messages.length === 0 || !hasUserMessages) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === "jd") return;
    scrollToLatest("smooth");
  }, [messages, hasUserMessages]);

  useEffect(() => {
    const root = scrollRef.current;
    const target = jdRef.current;
    if (!root || !target || !hasUserMessages) {
      setJdPinned(false);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setJdPinned(!entry.isIntersecting);
      },
      { root, threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [campaign?.id, messages.length, hasUserMessages]);

  const scrollToJd = () => {
    jdRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSendMessage = () => {
    const text = messageInput.trim();
    if (!text) return;

    const userMessageId = Date.now();
    const botMessageId = userMessageId + 1;

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, from: "user", text },
      {
        id: botMessageId,
        from: "bot",
        text: "Mình đã ghi nhận câu hỏi của bạn, bộ phận tuyển dụng sẽ phản hồi chi tiết trong cuộc trò chuyện này.",
      },
    ]);
    setMessageInput("");
    scrollToLatest();
  };

  if (!campaign) return null;

  return (
    <div className={cx("chatPanel")}>
      {jdPinned && (
        <button type="button" className={cx("jdStickyPin")} onClick={scrollToJd}>
          <span className={cx("jdStickyPinAvatar")} aria-hidden="true">
            <Chatbot />
          </span>
          <span className={cx("jdStickyPinText")}>
            <strong>{campaign.title}</strong>
            <em>{campaign.department}</em>
          </span>
          <span className={cx("jdStickyPinHint")}>Xem chi tiết JD</span>
        </button>
      )}

      <div ref={scrollRef} className={cx("chatMessages")}>
        {messages.map((message) => {
          if (message.type === "jd") {
            return (
              <CampaignJdMessage
                key={message.id}
                ref={jdRef}
                campaign={campaign}
                onApply={onApply}
                showApplyButton={showApplyButton}
              />
            );
          }

          return (
            <div
              key={message.id}
              className={cx("messageRow", {
                user: message.from === "user",
                bot: message.from === "bot",
              })}
            >
              {message.from === "bot" && (
                <span className={cx("botMessageAvatar")} aria-hidden="true">
                  <Chatbot />
                </span>
              )}
              <span className={cx("messageBubble")}>{message.text}</span>
            </div>
          );
        })}
        <div ref={messagesEndRef} className={cx("chatMessagesAnchor")} aria-hidden="true" />
      </div>

      <div className={cx("quickActions")}>
        <button
          type="button"
          onClick={() => setMessageInput("Quy trình ứng tuyển như thế nào?")}
        >
          Quy trình ứng tuyển
        </button>
        <button
          type="button"
          onClick={() => setMessageInput("Yêu cầu công việc chi tiết ra sao?")}
        >
          Yêu cầu công việc
        </button>
        <button
          type="button"
          onClick={() => setMessageInput("Tôi muốn nộp CV trực tiếp.")}
        >
          Tôi muốn nộp CV
        </button>
      </div>

      <div className={cx("chatInput")}>
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Vui lòng nhập tin nhắn trò chuyện"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button type="button" onClick={handleSendMessage}>
          Gửi
        </button>
      </div>
    </div>
  );
};

export default CampaignChatPanel;

export const buildChatMessagesForCampaign = (campaign, candidateName) => [
  { id: `jd-${campaign.id}`, type: "jd" },
  {
    id: `welcome-${campaign.id}`,
    from: "bot",
    text: `Xin chào ${candidateName}, mình là trợ lý tuyển dụng AI. Bạn muốn hỏi gì về vị trí ${campaign.title}?`,
  },
];
