import { Layout } from "antd";
import PageContent from "../../routes";

const DesktopLayout = ({ isPublicPage, isHiddenPage }) => {
  return (
    <Layout hasSider id="app">
      <Layout className="desktop-inner-layout">
        <div className="desktop-main-outlet">
          <PageContent />
        </div>
      </Layout>
    </Layout>
  );
};

export default DesktopLayout;
