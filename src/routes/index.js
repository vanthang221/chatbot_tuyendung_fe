import { useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import useMediaQuery from "../hooks/useMediaQuery";
import pages from "../pages";
import { RecruitmentProvider } from "../context/RecruitmentContext";
import RecruitmentLayout from "../layouts/desktop/RecruitmentLayout";
import { isEmpty } from "../utils/helps";

const PageContent = () => {
  const userLogin = useSelector((state) => state?.profile);

  const maxSmSize = useMediaQuery("(max-width: 1024px)");
  const isMobileDevice = /Mobi|Android|iPhone|iPad|iPod|Macintosh/i.test(
    window.navigator.userAgent,
  );

  const containerStyle = {
    width: "calc(100vw - 53px)",
    marginLeft: "49px",
    height: "100%",
    minHeight: "100vh",
  };

  const filteredPages = pages.filter((page) =>
    !isEmpty(userLogin) ? page : !page?.auth,
  );

  return isMobileDevice && maxSmSize ? (
    <div style={containerStyle}>
      <Routes>
        {filteredPages.map((page, index) => (
          <Route key={index} path={page.path} element={page?.elementMobile} />
        ))}
      </Routes>
    </div>
  ) : (
    <RecruitmentProvider>
      <RecruitmentLayout>
        <Routes>
          {filteredPages.map((page, index) => (
            <Route key={index} path={page.path} element={page?.elementDesktop} />
          ))}
        </Routes>
      </RecruitmentLayout>
    </RecruitmentProvider>
  );
};

export default PageContent;
