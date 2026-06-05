import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import { Button, Input } from "antd";
import { Chatbot } from "../../../../assets/svg";
import {
  WordIcon,
  PdfIcon,
  PptxIcon,
  ExcelIcon,
  DefaultIcon,
} from "../../../../assets";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import {
  actionEnsureRecruitmentChatSession,
  actionSendRecruitmentChatMessage,
} from "./action";
import {
  buildCandidatePayload,
  buildJobContextPayload,
  buildRecruitmentSessionKey,
  buildUserInfoPayload,
  mergeChatMessages,
  mergeSessionMessagesWithCampaignUi,
} from "./chatMessageUtils";
import { buildChatMessagesFromUploadPayload } from "./uploadCvUtils";
import {
  getChatSessionToken,
  saveChatSessionToStorage,
} from "./chatSessionStorage";
import { hasCandidateInfo } from "./candidateStorage";
import CampaignJdMessage from "./CampaignJdMessage";
import ChatMarkdownContent from "./ChatMarkdownContent";
import styles from "./ChatBotRecruiment.module.sass";
const cx = classNames.bind(styles);

const SCROLL_BOTTOM_THRESHOLD = 80;

const normalizeFilePayloads = (rawFiles) => {
  if (!Array.isArray(rawFiles)) return [];

  return rawFiles
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          name: `cv-${index + 1}`,
          url: item,
        };
      }

      if (!item || typeof item !== "object") return null;

      const path =
        item.url ||
        item.cv_path ||
        item.path ||
        item.file_url ||
        item.link ||
        "";

      return {
        name:
          item.name ||
          item.file_name ||
          item.filename ||
          item.original_name ||
          item.cv_file ||
          `cv-${index + 1}`,
        url: path,
        cv_path: item.cv_path || path,
        path,
        file_path: path,
        extension:
          item.extension ||
          item.extension_file ||
          (path || item.name || "").split(".").pop()?.toLowerCase(),
        type: item.type || item.mime_type || "",
      };
    })
    .filter((file) => file && (file.url || file.cv_path));
};

const GENERAL_CHAT_KEY = "__general__";



const CampaignChatPanel = ({ campaign, onApply, showApplyButton }) => {
  const {
    candidateInfo,
    setCandidateInfo,
    getMessagesForCampaign,
    setMessagesForCampaign,
  } = useRecruitment();

  const campaignId = campaign?.id;
  const conversationKey = campaignId ?? GENERAL_CHAT_KEY;
  const messages = getMessagesForCampaign(conversationKey);
  const setMessages = (updater) => setMessagesForCampaign(conversationKey, updater);
  const [messageInput, setMessageInput] = useState("");
  const [jdPinned, setJdPinned] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [sessionToken, setSessionToken] = useState(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [pendingCvFiles, setPendingCvFiles] = useState([]);
  const [candidateId, setCandidateId] = useState(null);
  const scrollRef = useRef(null);
  const jdRef = useRef(null);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  const isNearBottomRef = useRef(true);
  const pendingScrollToEndRef = useRef(false);

  const focusMessageInput = () => {
    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  };

  const scrollToLatest = (behavior = "smooth") => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior });
    }
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    isNearBottomRef.current = true;
    setShowScrollToBottom(false);
  };

  const updateScrollPosition = () => {
    const el = scrollRef.current;

    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const nearBottom = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;

    isNearBottomRef.current = nearBottom;

    setShowScrollToBottom(distanceFromBottom > SCROLL_BOTTOM_THRESHOLD);
  };

  const hasUserMessages = messages.some((message) => message.from === "user");
  const fallbackCvFiles = normalizeFilePayloads(
    candidateInfo?.file_payloads ||
    candidateInfo?.cvFiles ||
    candidateInfo?.cv_files ||
    candidateInfo?.uploadedFiles ||
    candidateInfo?.resumeFiles ||
    candidateInfo?.cv ||
    [],
  );
  const userInfoPayload = buildUserInfoPayload(candidateInfo);
  const jobContextPayload = buildJobContextPayload(campaign, campaignId);
  const sessionKey = buildRecruitmentSessionKey(
    userInfoPayload.phone,
    campaignId,
  );
  const cvUploadContext = {
    userId: userInfoPayload.phone,
    jobContext: jobContextPayload,
    session: sessionKey,
    sessionToken,
    userInfo: userInfoPayload,
    candidate: buildCandidatePayload(candidateInfo),
  };

  useEffect(() => {
    if (!hasCandidateInfo(candidateInfo)) {
      setSessionReady(false);

      setSessionToken(null);

      return undefined;
    }
    let cancelled = false;

    const initSession = async () => {
      setSessionReady(false);

      const storedToken = getChatSessionToken(conversationKey);
      const cachedMessages = getMessagesForCampaign(conversationKey);

      if (storedToken && cachedMessages.length > 0) {
        if (!cancelled) {
          setSessionToken(storedToken);
          setSessionReady(true);
        }
        return;
      }

      try {
        const sessionPayload = {
          candidate: buildCandidatePayload(candidateInfo),
        };

        if (campaignId) {
          sessionPayload.campaign_id = campaignId;
        }

        if (storedToken) {
          sessionPayload.session_token = storedToken;
        }

        const response = await actionEnsureRecruitmentChatSession(sessionPayload);
        if (cancelled) return;
        const payload = response?.data;
        if (payload?.success && payload?.data) {
          const { session, messages: apiMessages, candidate } = payload.data;
          setCandidateId(candidate?.id ?? null);
          setSessionToken(session?.session_token || null);
          if (session?.session_token) {
            saveChatSessionToStorage(conversationKey, session.session_token);
          }
          setMessagesForCampaign(
            conversationKey,
            mergeSessionMessagesWithCampaignUi(
              campaign,
              candidateInfo.fullName,
              apiMessages,
            ),
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        if (!cancelled) {
          setSessionReady(true);
        }
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, [
    campaignId,
    candidateInfo.email,
    candidateInfo.fullName,
    candidateInfo.phone,
    conversationKey,
    getMessagesForCampaign,
    setMessagesForCampaign,
  ]);

  useEffect(() => {
    if (sessionReady && sessionToken) {
      focusMessageInput();
    }
  }, [sessionReady, sessionToken]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    el.addEventListener("scroll", updateScrollPosition, { passive: true });
    updateScrollPosition();

    return () => el.removeEventListener("scroll", updateScrollPosition);
  }, [campaignId]);

  useEffect(() => {
    updateScrollPosition();
  }, [messages]);

  useLayoutEffect(() => {
    if (!pendingScrollToEndRef.current && !sending) return;
    scrollToLatest("smooth");
    if (!sending) {
      pendingScrollToEndRef.current = false;
    }
  }, [messages, sending]);

  useEffect(() => {
    if (messages.length === 0 || !hasUserMessages) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === "jd") return;
    if (pendingScrollToEndRef.current) return;
    if (!isNearBottomRef.current) return;
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
  }, [campaignId, messages.length, hasUserMessages]);

  const scrollToJd = () => {
    jdRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const handleCvUploaded = (uploadResult) => {
    const files = uploadResult?.files ?? uploadResult;
    const normalized = normalizeFilePayloads(
      Array.isArray(files) ? files : [],
    );
    setPendingCvFiles(normalized);

    if (normalized.length > 0) {
      setCandidateInfo({ ...candidateInfo, cv_files: normalized });
    }

    const uploadMessages = buildChatMessagesFromUploadPayload(
      uploadResult?.payload,
    );
    if (uploadMessages.length > 0) {
      pendingScrollToEndRef.current = true;
      setMessages((prev) => {
        return mergeChatMessages(prev, uploadMessages);
      });
    }
  };

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !sessionToken || sending) return;
    const tempUserId = `temp-user-${Date.now()}`;
    pendingScrollToEndRef.current = true;
    setMessages((prev) => [...prev, { id: tempUserId, from: "user", text }]);
    setMessageInput("");
    setSending(true);

    try {
      const messagePayload = {
        session_id: sessionKey,
        message: text,
        user_info: userInfoPayload,
        session_token: sessionToken,
      };

      if (jobContextPayload) {
        messagePayload.job_context = jobContextPayload;
      }

      const response = await actionSendRecruitmentChatMessage(messagePayload);

      const payload = response?.data;

      if (payload?.success && payload?.data?.messages) {
        const persistedMessages = payload.data.messages;

        setMessages((prev) => {
          const withoutTemp = prev.filter((item) => item.id !== tempUserId);

          return mergeChatMessages(withoutTemp, persistedMessages);
        });

        if (payload.data.session?.session_token) {
          setSessionToken(payload.data.session.session_token);

          saveChatSessionToStorage(
            conversationKey,
            payload.data.session.session_token,
          );
        }
      } else {
        setMessages((prev) => prev.filter((item) => item.id !== tempUserId));
      }
    } catch (error) {
      console.log(error);
      setMessages((prev) => prev.filter((item) => item.id !== tempUserId));
    } finally {
      setPendingCvFiles([]);
      pendingScrollToEndRef.current = true;
      setSending(false);
      focusMessageInput();
    }
  };

  const handleScrollToBottom = () => {
    isNearBottomRef.current = true;
    scrollToLatest("smooth");
  };

  const chatInputDisabled = !sessionReady || !sessionToken;
  const sendDisabled = chatInputDisabled || sending;

  return (
    <div className={cx("chatPanel")}>
      {campaign && jdPinned && (
        <Button
          type="text"
          className={cx("jdStickyPin")}
          onClick={scrollToJd}
          block
        >
          <span className={cx("jdStickyPinAvatar")} aria-hidden="true">
            <Chatbot />
          </span>

          <span className={cx("jdStickyPinText")}>
            <strong>{campaign.title}</strong>

            <em>{campaign.department}</em>
          </span>

          <span className={cx("jdStickyPinHint")}>Xem chi tiết JD</span>
        </Button>
      )}

      <div className={cx("chatMessagesWrap")}>
        <div ref={scrollRef} className={cx("chatMessages")}>
          {messages.map((message, messageIndex) => {
            if (campaign && message.type === "jd") {
              return (
                <CampaignJdMessage
                  key={message.id ?? `jd-${messageIndex}`}
                  ref={jdRef}
                  campaign={campaign}
                  campaignId={campaignId}
                  candidateId={candidateId}
                  uploadContext={cvUploadContext}
                  onCvUploaded={handleCvUploaded}
                  onApply={onApply}
                  showApplyButton={showApplyButton}
                />
              );
            }

            if (message.type === "file") {
              const attachment =
                message.attachment || (message.attachments && message.attachments[0]) || null;

              const filename =
                attachment?.name || attachment?.original_name || attachment?.file_name ||
                (Array.isArray(message.file_urls) && message.file_urls[0]) ||
                "file";

              const ext = (filename || "").split(".").pop()?.toLowerCase() || "";

              let Icon = DefaultIcon;
              if (ext === "pdf") Icon = PdfIcon;
              else if (ext === "doc" || ext === "docx") Icon = WordIcon;
              else if (ext === "ppt" || ext === "pptx") Icon = PptxIcon;
              else if (ext === "xls" || ext === "xlsx" || ext === "csv") Icon = ExcelIcon;

              return (
                <div
                  key={message.id ?? `file-${messageIndex}`}
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

                  <div className={cx("messageBubble", message.from === "user" ? "userMessageBubble" : "")}>
                    <span className={cx("chatFileAttachment")}>
                      <span className={cx("chatFileAttachmentIcon")}>
                        <Icon aria-hidden="true" />
                      </span>
                      <span className={cx("chatFileAttachmentName")}>{filename}</span>
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={message.id ?? `msg-${messageIndex}`}
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

                {message.from === "bot" ? (
                  <div className={cx("messageBubble")}>
                    <ChatMarkdownContent content={message.text} />
                  </div>
                ) : (
                  <div className={cx("messageBubble", "userMessageBubble")}>
                    <span>{message.text}</span>
                  </div>
                )}
              </div>
            );
          })}

          {sending && (
            <div className={cx("messageRow", "bot", "typingRow")}>
              <span className={cx("botMessageAvatar")} aria-hidden="true">
                <Chatbot />
              </span>
              <div className={cx("messageBubble", "typingBubble")}>
                <span className={cx("typingText")}>Đang xử lý yêu cầu</span>
                <span className={cx("typingDots")} aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}

          <div
            ref={messagesEndRef}
            className={cx("chatMessagesAnchor")}
            aria-hidden="true"
          />
        </div>

        {showScrollToBottom && (
          <Button
            type="primary"
            shape="circle"
            className={cx("scrollToBottomBtn")}
            onClick={handleScrollToBottom}
            aria-label="Cuộn đến tin nhắn mới nhất"
            title="Tin nhắn mới nhất"
          >
            <span className={cx("scrollToBottomIcon")} aria-hidden="true" />
          </Button>
        )}
      </div>

      <div className={cx("quickActions")}>
        <Button
          size="small"
          className={cx("quickActionBtn")}
          disabled={chatInputDisabled}
          onClick={() => {
            setMessageInput(
              campaign
                ? "Quy trình ứng tuyển như thế nào?"
                : "Quy trình tuyển dụng chung của công ty như thế nào?",
            );
            focusMessageInput();
          }}
        >
          {campaign ? "Quy trình ứng tuyển" : "Quy trình tuyển dụng"}
        </Button>

        <Button
          size="small"
          className={cx("quickActionBtn")}
          disabled={chatInputDisabled}
          onClick={() => {
            setMessageInput(
              campaign
                ? "Yêu cầu công việc chi tiết ra sao?"
                : "Công ty đang tuyển những vị trí nào?",
            );
            focusMessageInput();
          }}
        >
          {campaign ? "Yêu cầu công việc" : "Vị trí đang tuyển"}
        </Button>

        <Button
          size="small"
          className={cx("quickActionBtn")}
          disabled={chatInputDisabled}
          onClick={() => {
            setMessageInput(
              campaign
                ? "Tôi muốn nộp CV trực tiếp."
                : "Tôi muốn hỏi thêm về cơ hội phù hợp với hồ sơ của tôi.",
            );
            focusMessageInput();
          }}
        >
          {campaign ? "Tôi muốn nộp CV" : "Hỏi thêm về cơ hội"}
        </Button>
      </div>

      <div className={cx("chatInput")}>
        <Input
          ref={messageInputRef}
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          autoFocus
          placeholder={
            sessionReady
              ? "Vui lòng nhập tin nhắn trò chuyện"
              : "Đang kết nối phiên trò chuyện..."
          }
          disabled={chatInputDisabled}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || sendDisabled) return;
            e.preventDefault();
            handleSendMessage();
          }}
        />

        <Button
          type="primary"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSendMessage}
          loading={sending}
          disabled={sendDisabled}
        >
          Gửi
        </Button>
      </div>
    </div>
  );
};

export default CampaignChatPanel;
