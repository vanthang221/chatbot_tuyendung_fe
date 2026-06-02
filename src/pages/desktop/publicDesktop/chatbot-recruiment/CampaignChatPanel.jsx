import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

import classNames from "classnames/bind";

import { Button, Input } from "antd";

import { Chatbot } from "../../../../assets/svg";

import { useRecruitment } from "../../../../context/RecruitmentContext";

import {

  actionEnsureRecruitmentChatSession,

  actionSendRecruitmentChatMessage,

} from "./action";

import {

  buildCandidatePayload,

  mergeSessionMessagesWithCampaignUi,

} from "./chatMessageUtils";

import { saveChatSessionToStorage } from "./chatSessionStorage";

import { hasCandidateInfo } from "./candidateStorage";

import CampaignJdMessage from "./CampaignJdMessage";

import styles from "./ChatBotRecruiment.module.sass";



const cx = classNames.bind(styles);



const SCROLL_BOTTOM_THRESHOLD = 80;



const CampaignChatPanel = ({ campaign, onApply, showApplyButton }) => {

  const {

    candidateInfo,

    getMessagesForCampaign,

    setMessagesForCampaign,

  } = useRecruitment();



  const campaignId = campaign?.id;

  const messages = getMessagesForCampaign(campaignId);

  const setMessages = (updater) => setMessagesForCampaign(campaignId, updater);



  const [messageInput, setMessageInput] = useState("");

  const [jdPinned, setJdPinned] = useState(false);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const [sessionToken, setSessionToken] = useState(null);

  const [sessionReady, setSessionReady] = useState(false);

  const [sending, setSending] = useState(false);

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



    const distanceFromBottom =

      el.scrollHeight - el.scrollTop - el.clientHeight;

    const nearBottom = distanceFromBottom <= SCROLL_BOTTOM_THRESHOLD;



    isNearBottomRef.current = nearBottom;

    setShowScrollToBottom(distanceFromBottom > SCROLL_BOTTOM_THRESHOLD);

  };



  const hasUserMessages = messages.some((message) => message.from === "user");



  useEffect(() => {

    if (!campaignId || !hasCandidateInfo(candidateInfo)) {

      setSessionReady(false);

      setSessionToken(null);

      return undefined;

    }



    let cancelled = false;



    const initSession = async () => {

      setSessionReady(false);

      try {

        const response = await actionEnsureRecruitmentChatSession({

          campaign_id: campaignId,

          candidate: buildCandidatePayload(candidateInfo),

        });



        if (cancelled) return;



        const payload = response?.data;

        if (payload?.success && payload?.data) {

          const { session, messages: apiMessages } = payload.data;

          setSessionToken(session?.session_token || null);

          if (session?.session_token) {

            saveChatSessionToStorage(campaignId, session.session_token);

          }

          setMessagesForCampaign(

            campaignId,

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

    campaign,

    campaignId,

    candidateInfo.email,

    candidateInfo.fullName,

    candidateInfo.phone,

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
    if (!pendingScrollToEndRef.current) return;
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



  const handleSendMessage = async () => {

    const text = messageInput.trim();

    if (!text || !sessionToken || sending) return;



    const tempUserId = `temp-user-${Date.now()}`;

    pendingScrollToEndRef.current = true;
    setMessages((prev) => [...prev, { id: tempUserId, from: "user", text }]);
    setMessageInput("");

    setSending(true);

    try {

      const response = await actionSendRecruitmentChatMessage({

        session_token: sessionToken,

        campaign_id: campaignId,

        candidate: buildCandidatePayload(candidateInfo),

        content: text,

      });



      const payload = response?.data;

      if (payload?.success && payload?.data?.messages) {

        const persistedMessages = payload.data.messages;

        setMessages((prev) => {

          const withoutTemp = prev.filter((item) => item.id !== tempUserId);

          return [...withoutTemp, ...persistedMessages];

        });



        if (payload.data.session?.session_token) {

          setSessionToken(payload.data.session.session_token);

          saveChatSessionToStorage(campaignId, payload.data.session.session_token);

        }

      } else {

        setMessages((prev) => prev.filter((item) => item.id !== tempUserId));

      }

    } catch (error) {

      console.log(error);

      setMessages((prev) => prev.filter((item) => item.id !== tempUserId));

    } finally {
      pendingScrollToEndRef.current = true;
      setSending(false);
      focusMessageInput();
    }
  };



  const handleScrollToBottom = () => {

    isNearBottomRef.current = true;

    scrollToLatest("smooth");

  };



  if (!campaign) return null;



  const chatInputDisabled = !sessionReady || !sessionToken;
  const sendDisabled = chatInputDisabled || sending;



  return (

    <div className={cx("chatPanel")}>

      {jdPinned && (

        <Button type="text" className={cx("jdStickyPin")} onClick={scrollToJd} block>

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
            setMessageInput("Quy trình ứng tuyển như thế nào?");
            focusMessageInput();
          }}

        >

          Quy trình ứng tuyển

        </Button>

        <Button

          size="small"

          className={cx("quickActionBtn")}

          disabled={chatInputDisabled}

          onClick={() => {
            setMessageInput("Yêu cầu công việc chi tiết ra sao?");
            focusMessageInput();
          }}

        >

          Yêu cầu công việc

        </Button>

        <Button

          size="small"

          className={cx("quickActionBtn")}

          disabled={chatInputDisabled}

          onClick={() => {
            setMessageInput("Tôi muốn nộp CV trực tiếp.");
            focusMessageInput();
          }}

        >

          Tôi muốn nộp CV

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


