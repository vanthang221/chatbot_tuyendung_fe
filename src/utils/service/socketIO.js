import socketIOClient from "socket.io-client";
import { message } from "antd";
import Cookies from "js-cookie";
import {
  AIPT_WEB_TOKEN,
  REACT_APP_SERVER_BASE_URL,
} from "../../../src/utils/constants/config";

// initialize
const URI =
  `${REACT_APP_SERVER_BASE_URL}`.toLocaleLowerCase() === "null"
    ? null
    : REACT_APP_SERVER_BASE_URL;
const socketIO = socketIOClient(URI, { autoConnect: false });

export const connectSocket = () => {
  if (!socketIO.connected) {
    socketIO.io.opts.extraHeaders = {
      Authorization: Cookies.get(AIPT_WEB_TOKEN),
    };

    setTimeout(() => socketIO.connect(), 500);
  }
};

// message
socketIO.on("message", (data) => {
  const { msg, status } = data;

  if (status === 200) {
    message.success(msg);
  } else {
    message.error(msg);
  }
});

export default socketIO;
