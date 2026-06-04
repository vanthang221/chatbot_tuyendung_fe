import React from "react";
import classNames from "classnames/bind";
import { Button } from "antd";
import { getCvPreviewMode } from "./uploadCvUtils";
import styles from "./ChatBotRecruiment.module.sass";

const cx = classNames.bind(styles);

const CvFilePreview = ({ file, previewUrl, onChangeFile, disabled }) => {
  if (!file || !previewUrl) return null;

  const mode = getCvPreviewMode(file);

  return (
    <div className={cx("uploadCvPreview")}>
      <div className={cx("uploadCvPreviewHead")}>
        <div className={cx("uploadCvPreviewMeta")}>
          <span className={cx("uploadCvPreviewName")} title={file.name}>
            {file.name}
          </span>
        </div>
        <Button
          type="link"
          size="small"
          onClick={onChangeFile}
          disabled={disabled}
          className={cx("uploadCvChangeFile")}
        >
          Đổi file
        </Button>
      </div>

      {mode === "pdf" ? (
        <iframe
          title={`Xem trước ${file.name}`}
          src={previewUrl}
          className={cx("uploadCvPreviewFrame")}
        />
      ) : (
        <div className={cx("uploadCvPreviewOffice")}>
          <span className={cx("uploadCvPreviewOfficeIcon")} aria-hidden="true">
            📄
          </span>
          <p>
            Trình duyệt không hiển thị trực tiếp file Word. Bạn có thể mở file để
            kiểm tra nội dung trước khi tải lên.
          </p>
          <Button
            type="default"
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            disabled={disabled}
          >
            Mở file để xem
          </Button>
        </div>
      )}
    </div>
  );
};

export default CvFilePreview;
