import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames/bind";
import { Button, Modal, message } from "antd";
import { actionUploadRecruitmentFile } from "../action";
import CvFilePreview from "../CvFilePreview";
import {
  CV_MAX_BYTES,
  isAllowedCvFile,
  mapUploadedFileToPayload,
} from "../uploadCvUtils";
import styles from "../Modal/../ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const appendUploadContextToFormData = (formData, uploadContext) => {
  if (!uploadContext) return;

  const {
    userId,
    jobContext,
    session,
    sessionToken,
    userInfo,
    candidate,
  } = uploadContext;

  if (userId) {
    formData.append("user_id", String(userId));
  }
  if (jobContext) {
    formData.append("job_context", jobContext);
  }
  if (session) {
    formData.append("session", String(session));
    formData.append("session_id", String(session));
  }
  if (sessionToken) {
    formData.append("session_token", sessionToken);
  }
  if (userInfo) {
    formData.append("user_info", JSON.stringify(userInfo));
  }
  if (candidate) {
    formData.append("candidate", JSON.stringify(candidate));
  }
};

const UploadCvModal = ({
  open,
  onClose,
  campaignId,
  candidateId,
  uploadContext,
  onSuccess,
}) => {
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const resetState = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploading(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (uploading) return;
    resetState();
    onClose?.();
  };

  const handlePickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAllowedCvFile(file)) {
      message.error("Chỉ chấp nhận file PDF, DOC, DOCX");
      event.target.value = "";
      return;
    }

    if (file.size > CV_MAX_BYTES) {
      message.error("File vượt quá 10MB");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleChangeFile = () => {
    if (uploading) return;
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.warning("Vui lòng chọn file CV");
      return;
    }

    if (!campaignId) {
      message.error("Thiếu thông tin chiến dịch. Vui lòng tải lại trang.");
      return;
    }

    if (!uploadContext?.userId || !uploadContext?.session) {
      message.error("Thiếu thông tin phiên chat. Vui lòng tải lại trang.");
      return;
    }

    const candidatePayload = uploadContext?.candidate;
    if (!candidateId && !candidatePayload?.email) {
      message.error(
        "Thiếu thông tin ứng viên. Vui lòng điền họ tên, email và số điện thoại.",
      );
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (campaignId != null && campaignId !== "") {
      formData.append("campaign_id", String(campaignId));
    } if (candidateId) {
      formData.append("candidate_id", String(candidateId));
    }
    formData.append("is_cv", "true");
    appendUploadContextToFormData(formData, uploadContext);

    setUploading(true);
    try {
      const response = await actionUploadRecruitmentFile(formData);
      const payload = response?.data;

      if (!payload?.success) {
        message.error(payload?.error || "Tải file thất bại");
        return;
      }

      if (
        !payload?.cv &&
        !payload?.data &&
        !payload?.ai_response &&
        !(payload?.messages?.length > 0)
      ) {
        message.error("Tải file thất bại");
        return;
      }

      const filePayload = mapUploadedFileToPayload(
        payload.cv || payload.data,
        payload.file_urls,
      );

      message.success("Tải CV thành công");
      onSuccess?.({
        files: filePayload ? [filePayload] : [],
        payload,
      });
      resetState();
      onClose?.();
    } catch (error) {
      const apiError =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message;
      message.error(apiError || "Tải file thất bại");
    } finally {
      setUploading(false);
    }
  };

  const hasPreview = Boolean(selectedFile && previewUrl);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      centered
      width={hasPreview ? 640 : 480}
      destroyOnClose
      className={cx("uploadCvModal", { uploadCvModalWithPreview: hasPreview })}
      title="Tải CV / tài liệu ứng tuyển"
      closable={!uploading}
      maskClosable={!uploading}
    >
      <p className={cx("uploadCvHint")}>
        Chọn file CV của bạn (PDF, DOC, DOCX — tối đa 10MB)
      </p>

      {!hasPreview ? (
        <button
          type="button"
          className={cx("uploadCvDropzone")}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          <span className={cx("uploadCvDropzoneIcon")} aria-hidden="true">
            📁
          </span>
          <span className={cx("uploadCvDropzoneTitle")}>Nhấn để chọn file</span>
          <span className={cx("uploadCvDropzoneSub")}>
            PDF, DOC, DOCX — tối đa 10MB
          </span>
        </button>
      ) : (
        <CvFilePreview
          file={selectedFile}
          previewUrl={previewUrl}
          onChangeFile={handleChangeFile}
          disabled={uploading}
        />
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className={cx("uploadCvFileInput")}
        onChange={handlePickFile}
      />

      <div className={cx("uploadCvActions")}>
        <Button onClick={handleClose} disabled={uploading}>
          Hủy
        </Button>
        <Button
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          disabled={!selectedFile}
        >
          Tải lên và ứng tuyển
        </Button>
      </div>
    </Modal>
  );
};

export default UploadCvModal;
