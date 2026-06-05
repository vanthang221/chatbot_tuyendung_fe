export const CV_ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
export const CV_ACCEPT_ATTR =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const CV_MAX_BYTES = 10 * 1024 * 1024;

export const getFileExtension = (filename = "") => {
  const dot = filename.lastIndexOf(".");
  return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
};

/** Extension không có dấu chấm: pdf, docx, ... */
export const getFileExtensionKey = (filename = "") => {
  const ext = getFileExtension(filename);
  return ext ? ext.replace(/^\./, "") : "";
};

export const mapCvToAttachment = (cvRecord, fileUrls = []) => {
  if (!cvRecord && (!fileUrls || fileUrls.length === 0)) return null;

  const path =
    cvRecord?.cv_path || cvRecord?.path || fileUrls?.[0] || cvRecord?.url || "";
  const name =
    cvRecord?.original_name ||
    cvRecord?.original_filename ||
    cvRecord?.cv_file ||
    cvRecord?.name ||
    "cv";

  if (!path && !name) return null;

  const extension = getFileExtensionKey(name || path);

  return {
    name,
    original_name: name,
    cv_path: path,
    path,
    file_path: path,
    file_url: path,
    doc_path: path,
    extension,
    extension_file: extension,
    id: cvRecord?.id,
    cv_id: cvRecord?.id,
    candidate_id: cvRecord?.candidate_id,
  };
};

/** Chuẩn hóa attachment để nút tải luôn gọi GET /api/recruitment/files/download */
export const resolveChatMessageAttachment = (message, options = {}) => {
  const { candidateId } = options;
  const raw = message?.attachment;
  const cvId = raw?.cv_id ?? raw?.id;
  const candId = raw?.candidate_id ?? candidateId;

  if (raw && (cvId != null || candId != null)) {
    const name = raw.original_name || raw.name || "CV";
    const downloadUrl =
      raw.download_url ||
      (cvId != null
        ? `/api/recruitment/files/download?cv_id=${cvId}`
        : candId != null
          ? `/api/recruitment/files/download?candidate_id=${candId}`
          : null);

    return {
      ...raw,
      name,
      original_name: name,
      cv_id: cvId,
      candidate_id: candId,
      download_url: downloadUrl,
    };
  }

  const text = String(message?.text ?? "").trim();
  if (message?.from !== "user" || !candId) return null;

  const legacyName = text.replace(/^.*đã gửi file:\s*/i, "").trim();
  const isFileMessage =
    message?.type === "file" ||
    /đã gửi file/i.test(text) ||
    Boolean(legacyName);

  if (!isFileMessage) return null;

  const name = legacyName || "CV";
  return {
    name,
    original_name: name,
    candidate_id: candId,
    download_url: `/api/recruitment/files/download?candidate_id=${candId}`,
  };
};

export const isAllowedCvFile = (file) => {
  if (!file?.name) return false;
  return CV_ALLOWED_EXTENSIONS.includes(getFileExtension(file.name));
};

/** pdf: xem trước trong trình duyệt; office: doc/docx */
export const getCvPreviewMode = (file) => {
  if (!file?.name) return null;
  const ext = getFileExtension(file.name);
  if (ext === ".pdf") return "pdf";
  if (ext === ".doc" || ext === ".docx") return "office";
  return null;
};

export const mapUploadedFileToPayload = (record, fileUrls = []) => {
  const attachment = mapCvToAttachment(record, fileUrls);
  if (!attachment) return null;

  return {
    name: attachment.name,
    url: attachment.cv_path || attachment.path || "",
    cv_path: attachment.cv_path,
    path: attachment.path,
    type: record?.content_type || record?.type || "",
    id: record?.id,
    candidate_id: record?.candidate_id,
    extension: attachment.extension,
  };
};

export const buildChatMessagesFromUploadPayload = (payload) => {
  if (!payload) return [];

  const cvRecord = payload.cv || payload.data;
  const attachment = mapCvToAttachment(cvRecord, payload.file_urls);
  const stableSuffix =
    cvRecord?.id != null ? `cv-${cvRecord.id}` : `${Date.now()}`;

  const buildUserFileMessage = () => {
    if (!attachment) return null;
    const downloadUrl = cvRecord?.id
      ? `/api/recruitment/files/download?cv_id=${cvRecord.id}`
      : cvRecord?.candidate_id
        ? `/api/recruitment/files/download?candidate_id=${cvRecord.candidate_id}`
        : null;
    return {
      id: `user-cv-${stableSuffix}`,
      from: "user",
      text: "",
      type: "file",
      attachment: {
        ...attachment,
        cv_id: cvRecord?.id ?? attachment?.cv_id,
        candidate_id: cvRecord?.candidate_id ?? attachment?.candidate_id,
        download_url: downloadUrl || attachment.download_url,
      },
    };
  };

  const apiMessages = payload.messages;
  if (Array.isArray(apiMessages) && apiMessages.length > 0) {
    return apiMessages.map((item, index) => {
      const from = item.from === "user" ? "user" : "bot";
      const message = {
        id:
          item.id != null
            ? item.id
            : from === "user"
              ? `user-cv-${stableSuffix}`
              : `bot-cv-${stableSuffix}-${index}`,
        from,
        text: item.text ?? item.content ?? "",
        type: item.type,
        attachment: item.attachment,
      };

      if (from === "user") {
        if (message.attachment || attachment) {
          message.attachment = {
            ...(message.attachment || attachment),
            ...attachment,
            cv_id:
              message.attachment?.cv_id ??
              item.attachment?.cv_id ??
              cvRecord?.id ??
              attachment?.cv_id,
            candidate_id:
              message.attachment?.candidate_id ??
              item.attachment?.candidate_id ??
              cvRecord?.candidate_id ??
              attachment?.candidate_id,
            download_url:
              message.attachment?.download_url ||
              item.attachment?.download_url ||
              attachment?.download_url ||
              (cvRecord?.id
                ? `/api/recruitment/files/download?cv_id=${cvRecord.id}`
                : cvRecord?.candidate_id
                  ? `/api/recruitment/files/download?candidate_id=${cvRecord.candidate_id}`
                  : null),
          };
          message.text = "";
          message.type = "file";
        }
      }

      return message;
    });
  }

  const result = [];
  const userFileMessage = buildUserFileMessage();
  if (userFileMessage) {
    result.push(userFileMessage);
  }

  const aiText = (payload.ai_response || "").trim();
  if (aiText) {
    result.push({
      id: `bot-cv-${stableSuffix}`,
      from: "bot",
      text: aiText,
    });
  }

  return result;
};
