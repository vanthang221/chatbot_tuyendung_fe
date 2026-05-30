export const DEFAULT_JOB_DESCRIPTION = [
  "Mô tả công việc sẽ được cập nhật bởi phòng tuyển dụng.",
];
export const DEFAULT_REQUIREMENTS = ["Yêu cầu sẽ được cập nhật bởi phòng tuyển dụng."];
export const DEFAULT_BENEFITS = ["Quyền lợi sẽ được cập nhật bởi phòng tuyển dụng."];
export const DEFAULT_WORKING_TIME = ["Thời gian làm việc sẽ được cập nhật."];

export const EXPERIENCE_OPTIONS = [
  "Không yêu cầu",
  "Dưới 1 năm",
  "1 năm",
  "2 năm",
  "3 năm",
  "4 năm",
  "5 năm",
  "Trên 5 năm",
];

export const SALARY_OPTIONS = [
  "Tất cả",
  "Dưới 10 triệu",
  "10 - 15 triệu",
  "15 - 20 triệu",
  "20 - 25 triệu",
  "25 - 30 triệu",
  "30 - 50 triệu",
  "Trên 50 triệu",
  "Thỏa thuận",
];

const FIELD_CANDIDATES = {
  id: ["id", "_id", "campaign_id"],
  title: ["title", "name", "position_name", "position", "campaign_name"],
  department: ["department", "department_name", "team", "phong_ban"],
  location: ["location", "work_place", "city", "dia_diem"],
  quantity: ["quantity", "vacancy", "headcount", "so_luong"],
  deadline: ["end_time", "deadline", "expired_at", "expire_date", "han_tuyen_dung"],
  status: ["status", "recruitment_status", "trang_thai"],
  description: ["jd_job_description", "description", "job_description", "mo_ta"],
  requirements: [
    "jd_competency_requirements",
    "requirements",
    "requirement",
    "yeu_cau",
  ],
  benefits: ["jd_benefits", "benefits", "welfare", "quyen_loi"],
  salaryRange: ["jd_salary_range", "salary_range", "salary"],
  workingTime: ["working_time", "working_hours", "gio_lam_viec"],
  experience: ["experience", "experience_level", "experience_years", "kinh_nghiem"],
};

const getFirstValue = (record, keys, fallback = "") => {
  if (!record) return fallback;

  for (const key of keys) {
    const value = record?.[key];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  if (record?.request_info) {
    for (const key of keys) {
      const value = record.request_info?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
  }

  return fallback;
};

const toArrayText = (value, fallback) => {
  if (Array.isArray(value)) {
    return value.length ? value : fallback;
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return fallback;
};

const formatDateFromUnix = (value, fallback = "--/--/----") => {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;

  const date = new Date(numberValue * 1000);
  if (Number.isNaN(date.getTime())) return fallback;

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const normalizeExperience = (value) => {
  const experienceMap = {
    0: "Không yêu cầu",
    1: "Dưới 1 năm",
    2: "1 năm",
    3: "2 năm",
    4: "3 năm",
    5: "4 năm",
    6: "5 năm",
    7: "Trên 5 năm",
  };

  if (typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value))) {
    return experienceMap[Number(value)] || "Không yêu cầu";
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return "Không yêu cầu";
};

const normalizeStatus = (value) => {
  const statusMap = {
    1: "Đang tuyển",
    2: "Tạm dừng",
    3: "Đã đóng",
    4: "Hoàn thành",
  };

  return statusMap[Number(value)] || "Đang tuyển";
};

const normalizeSalaryDisplay = (value) => {
  if (!value) return "Thỏa thuận";
  return String(value).replace(/M/gi, " triệu");
};

export const normalizeCampaign = (item, index) => {
  const status = normalizeStatus(getFirstValue(item, FIELD_CANDIDATES.status, 1));
  const salaryRange = normalizeSalaryDisplay(
    getFirstValue(item, FIELD_CANDIDATES.salaryRange, ""),
  );
  const experience = normalizeExperience(
    getFirstValue(item, FIELD_CANDIDATES.experience, ""),
  );

  return {
    id: getFirstValue(item, FIELD_CANDIDATES.id, `campaign-${index}`),
    title: getFirstValue(item, FIELD_CANDIDATES.title, "Vị trí đang tuyển"),
    department: getFirstValue(item, FIELD_CANDIDATES.department, "Phòng ban"),
    location: getFirstValue(item, FIELD_CANDIDATES.location, "Hà Nội"),
    quantity: String(getFirstValue(item, FIELD_CANDIDATES.quantity, "01")).padStart(2, "0"),
    deadline: formatDateFromUnix(getFirstValue(item, FIELD_CANDIDATES.deadline, "")),
    status,
    experience,
    salaryRange,
    description: toArrayText(
      getFirstValue(item, FIELD_CANDIDATES.description, DEFAULT_JOB_DESCRIPTION),
      DEFAULT_JOB_DESCRIPTION,
    ),
    requirements: toArrayText(
      getFirstValue(item, FIELD_CANDIDATES.requirements, DEFAULT_REQUIREMENTS),
      DEFAULT_REQUIREMENTS,
    ),
    benefits: toArrayText(
      getFirstValue(item, FIELD_CANDIDATES.benefits, DEFAULT_BENEFITS),
      DEFAULT_BENEFITS,
    ),
    workingTime: toArrayText(
      getFirstValue(item, FIELD_CANDIDATES.workingTime, DEFAULT_WORKING_TIME),
      DEFAULT_WORKING_TIME,
    ),
  };
};

export const extractCampaignList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const possibleKeys = ["data", "items", "results", "campaigns", "rows"];
  for (const key of possibleKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  for (const key of possibleKeys) {
    const nested = payload[key];
    if (nested && typeof nested === "object") {
      for (const nestedKey of possibleKeys) {
        if (Array.isArray(nested[nestedKey])) {
          return nested[nestedKey];
        }
      }
    }
  }

  return [];
};

export const matchesSalaryFilter = (salaryRange, filter) => {
  if (filter === "Tất cả") return true;

  const normalized = salaryRange.toLowerCase();
  if (filter === "Thỏa thuận") {
    return normalized.includes("thỏa thuận") || !salaryRange;
  }

  return normalized.includes(filter.toLowerCase());
};

export const findCampaignById = (campaigns, id) =>
  campaigns.find((item) => String(item.id) === String(id));
