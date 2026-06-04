import React from "react";
import { Modal, Row, Col, Button } from "antd";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import useMediaQuery from "../../hooks/useMediaQuery";
import { getUrlToOff } from "../../utils/helps";

const ViewFile = ({ record, onCancel }) => {
  const isMobile = useMediaQuery("(max-width: 1000px)");

  const docs = [
    {
      uri: `${getUrlToOff(record?.file_url || record?.path || record?.doc_path || record?.file_path || record?.cv_path)}`,
    },
  ];
  return (
    <Modal
      title="Xem file"
      open={true}
      footer={
        <Row justify={"end"}>
          <Col span={4}>
            <Button onClick={onCancel} className="w-full">
              Thoát
            </Button>
          </Col>
        </Row>
      }
      className={isMobile ? "fullscreen-modal-mobile" : "fullscreen-modal"}
      width="100vw"
      height={isMobile ? null : "100vh"}
    >
      <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} />
    </Modal>
  );
};

export default ViewFile;
