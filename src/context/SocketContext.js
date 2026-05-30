import React, { createContext, useContext, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  connectMessageChatSocket,
  disconnectMessageChatSocket,
  onConnect,
  onDisconnect,
  onConnectError,
  removeAllListeners,
} from "../utils/service/socket-message-chat";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [isMeetingChatConnected, setIsMeetingChatConnected] = useState(false);
  const userProfile = useSelector((state) => state.profile);

  useEffect(() => {
    if (!userProfile?.id) {
      setIsMeetingChatConnected(false);
      return;
    }

    // Connect to meeting chat socket
    connectMessageChatSocket();

    // Set up event listeners
    const handleConnect = () => {
      setIsMeetingChatConnected(true);
      // console.log("Connected to meeting chat socket");
    };

    const handleDisconnect = () => {
      setIsMeetingChatConnected(false);
      // console.log("Disconnected from meeting chat socket");
    };

    const handleConnectError = (error) => {
      // console.error("Meeting chat socket connection error:", error);
      setIsMeetingChatConnected(false);
    };

    // Register event listeners
    onConnect(handleConnect);
    onDisconnect(handleDisconnect);
    onConnectError(handleConnectError);

    // Cleanup
    return () => {
      removeAllListeners();
      disconnectMessageChatSocket();
    };
  }, [userProfile?.id]);

  const value = {
    isMeetingChatConnected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
