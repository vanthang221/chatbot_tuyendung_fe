import { useEffect } from "react";
import { useSelector } from "react-redux";
import { AIPT_WEB_TOKEN } from "./utils/constants/config";
import Cookies from "js-cookie";
import socketIO, {
  connectSocket,
} from "../../chatbot_fe/src/utils/service/socketIO";
import useMediaQuery from "../src/hooks/useMediaQuery";
import { SocketProvider } from "../../chatbot_fe/src/context/SocketContext";
import MobileLayout from "./layouts/mobile";
import DesktopLayout from "./layouts/desktop";
import { isEmpty } from "./utils/helps";

const App = () => {
  const userProfile = useSelector((state) => state.profile);

  const isPublicPage = true;
  const isHiddenPage = false;

  useEffect(() => {
    if (!isEmpty(userProfile)) {
      connectSocket();
      const _token = Cookies.get(AIPT_WEB_TOKEN);
      setTimeout(() => socketIO.emit("join", _token), 500);
    }
  }, [userProfile]);

  const maxSmSize = useMediaQuery("(max-width:1024px)");
  const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Macintosh/i.test(
    window.navigator.userAgent,
  );
  return (
    <SocketProvider>
      {isMobileDevice && maxSmSize ? (
        <MobileLayout isPublicPage={isPublicPage} />
      ) : (
        <DesktopLayout
          isHiddenPage={isHiddenPage}
          isPublicPage={isPublicPage}
        />
      )}
    </SocketProvider>
  );
};

export default App;
