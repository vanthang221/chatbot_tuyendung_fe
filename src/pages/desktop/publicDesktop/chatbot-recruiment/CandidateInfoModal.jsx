import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import { Button, Checkbox, Form, Input, Modal } from "antd";
import { useRecruitment } from "../../../../context/RecruitmentContext";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const CandidateInfoModal = ({
  open,
  onClose,
  campaignTitle = "",
  targetPath = "/chat",
}) => {
  const { candidateInfo, startChatSession } = useRecruitment();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        fullName: candidateInfo.fullName,
        email: candidateInfo.email,
        phone: candidateInfo.phone,
        consent: candidateInfo.consent,
      });
    }
  }, [open, candidateInfo, form]);

  const handleFinish = (values) => {
    startChatSession(values, campaignTitle);
    navigate(targetPath, { replace: true });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      destroyOnClose={false}
      className={cx("candidateModal")}
      title={null}
      closable
    >
      <div className={cx("registerPanel", "modalRegisterPanel")}>
        <p className={cx("welcomeText")}>Chào mừng bạn đến với</p>
        <h1>Trợ lý tuyển dụng AI</h1>
        <p className={cx("guideText")}>
          Tư vấn vị trí phù hợp và hỗ trợ tuyển dụng nhanh chóng
        </p>
        <p className={cx("formHint")}>
          Vui lòng điền thông tin để bắt đầu trò chuyện với trợ lý ảo tuyển dụng
        </p>
        <Form
          form={form}
          layout="vertical"
          className={cx("registerForm")}
          requiredMark
          onFinish={handleFinish}
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input type="email" placeholder="Email" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại" },
              {
                pattern: /^[0-9+\s()-]{8,15}$/,
                message: "Số điện thoại không hợp lệ",
              },
            ]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>
          <Form.Item
            name="consent"
            valuePropName="checked"
            className={cx("consentItem")}
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Bạn cần đồng ý để tiếp tục")),
              },
            ]}
          >
            <Checkbox>
              Tôi đồng ý cho công ty lưu trữ thông tin để hỗ trợ tuyển dụng
            </Checkbox>
          </Form.Item>
          <Form.Item className={cx("submitItem")}>
            <Button
              type="primary"
              htmlType="submit"
              block
              className={cx("startButton")}
            >
              Bắt đầu trò chuyện
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default CandidateInfoModal;
