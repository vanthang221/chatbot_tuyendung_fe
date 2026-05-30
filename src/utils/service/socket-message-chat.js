import socketIOClient from "socket.io-client";
import Cookies from "js-cookie";
import { AIPT_WEB_TOKEN, REACT_APP_SERVER_BASE_URL } from "../constants/config";

// Initialize socket for meeting chat
const URI =
  `${REACT_APP_SERVER_BASE_URL}`.toLocaleLowerCase() === "null"
    ? null
    : REACT_APP_SERVER_BASE_URL;
const socketMeetingChat = socketIOClient(URI, { autoConnect: false });

// Connect to socket
export const connectMessageChatSocket = () => {
  if (!socketMeetingChat.connected) {
    // Set Authorization header
    socketMeetingChat.io.opts.extraHeaders = {
      Authorization: Cookies.get(AIPT_WEB_TOKEN),
    };

    setTimeout(() => socketMeetingChat.connect(), 500);
  }
};

// Disconnect from socket
export const disconnectMessageChatSocket = () => {
  if (socketMeetingChat.connected) {
    socketMeetingChat.disconnect();
  }
};

// Tham gia phòng chat
export const joinMessageRoom = (meetingId, userId, scope_type) => {
  if (socketMeetingChat.connected) {
    socketMeetingChat.emit("join_conversation", {
      scope_id: meetingId,
      scope_type: scope_type,
      user_id: userId,
    });
  }
};

// Rời khỏi phòng chat
export const leaveMessageRoom = (
  meetingId,
  userId,
  last_read_message_id,
  scope_type,
) => {
  if (socketMeetingChat.connected) {
    socketMeetingChat.emit("leave_conversation", {
      scope_id: meetingId,
      scope_type: scope_type,
      user_id: userId,
      last_read_message_id: last_read_message_id,
    });
  }
};

// gửi tin nhắn đến phòng chat (gửi mới hoặc trả lời)
export const sendMessage = (
  meetingId,
  message,
  userId,
  user_name,
  reply_to_id = null,
) => {
  if (socketMeetingChat.connected) {
    socketMeetingChat.emit("send_message_conversation", {
      conversation_id: meetingId,
      content_text: message,
      sender_id: userId,
      user_name: user_name,
      reply_to_id: reply_to_id,
    });
  }
};

// tin nhắn mới
export const onMessageMessage = (callback) => {
  socketMeetingChat.on("new_message", callback);
};

// thu hồi tin nhắn
export const recallMessage = (messageId, userId) => {
  if (socketMeetingChat.connected) {
    socketMeetingChat.emit("revoke_message_conversation", {
      message_id: messageId,
      user_id: userId,
    });
  }
};

// tin nhắn đã xóa
export const onMessageRevoked = (callback) => {
  socketMeetingChat.on("message_revoked", callback);
};

// edit tn
export const editMessage = (messageId, userId, new_content_text) => {
  if (socketMeetingChat.connected) {
    socketMeetingChat.emit("edit_message_conversation", {
      message_id: messageId,
      user_id: userId,
      content_text: new_content_text,
    });
  }
};

// sự kiện đã sửa tn
export const onMessageEdited = (callback) => {
  socketMeetingChat.on("message_edited", callback);
};

// ghim tin nhắn
export const pinMessage = (messageId, userId, isPinned = true) => {
  if (socketMeetingChat.connected) {
    socketMeetingChat.emit("pin_message_conversation", {
      message_id: messageId,
      user_id: userId,
      is_pinned: isPinned,
    });
  }
};

// sự kiện tin nhắn đã ghim
export const onMessagePinned = (callback) => {
  socketMeetingChat.on("message_pinned", callback);
};

export const onMemberJoined = (callback) => {
  socketMeetingChat.on("user_joined", callback);
};

// Listen for connection status
export const onConnect = (callback) => {
  socketMeetingChat.on("connect", callback);
};

export const onDisconnect = (callback) => {
  socketMeetingChat.on("disconnect", callback);
};

export const onConnectError = (callback) => {
  socketMeetingChat.on("connect_error", callback);
};

//mới thêm
// Remove specific listeners
export const offMessageMessage = (callback) => {
  if (callback) {
    socketMeetingChat.off("new_message", callback);
  } else {
    socketMeetingChat.off("new_message");
  }
};

export const offMessageRevoked = (callback) => {
  if (callback) {
    socketMeetingChat.off("message_revoked", callback);
  } else {
    socketMeetingChat.off("message_revoked");
  }
};

export const offMessageEdited = (callback) => {
  if (callback) {
    socketMeetingChat.off("message_edited", callback);
  } else {
    socketMeetingChat.off("message_edited");
  }
};

export const offMessagePinned = (callback) => {
  if (callback) {
    socketMeetingChat.off("message_pinned", callback);
  } else {
    socketMeetingChat.off("message_pinned");
  }
};

export const offMemberJoined = (callback) => {
  if (callback) {
    socketMeetingChat.off("user_joined", callback);
  } else {
    socketMeetingChat.off("user_joined");
  }
};

// Remove all listeners
export const removeAllListeners = () => {
  socketMeetingChat.removeAllListeners();
};

export default socketMeetingChat;
