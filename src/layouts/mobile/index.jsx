import { Layout } from "antd";
import PageContent from "../../routes";

const MobileLayout = ({ isPublicPage }) => {
  return (
    <Layout hasSider id="app">
      <Layout>
        <PageContent />
      </Layout>
    </Layout>
  );
};

export default MobileLayout;
