import React, { useState } from "react";
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

const ChatPage = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { campaigns, messages, setMessages } = useRecruitment();
  const [messageInput, setMessageInput] = useState("");
  const campaign = findCampaignById(campaigns, campaignId);

  if (!campaign && campaigns.length > 0) {
    return <Navigate to="/" replace />;
  }

  if (!campaign) {
    return null;
  }

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
  };

  return (
    <div className={cx("applyBody")}>
      <ApplySidebar
        selectedId={campaignId}
        onSelectCampaign={(id) => navigate(`/${id}/apply`)}
      />
      <main className={cx("applyContent")}>
        <div className={cx("chatPanel")}>
          <div className={cx("chatMessages")}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={cx("messageRow", {
                  user: message.from === "user",
                  bot: message.from === "bot",
                })}
              >
                <span>{message.text}</span>
              </div>
            ))}
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
      </main>
    </div>
  );
};

export default ChatPage;
