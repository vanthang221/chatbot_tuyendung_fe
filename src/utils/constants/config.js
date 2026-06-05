export const {
  REACT_APP_SERVER_BASE_URL,

  REACT_APP_SERVER_CLOUD_URL,

  REACT_APP_SERVER_MISA_BASE_URL,

  REACT_APP_TELEGRAM_BOT,

  REACT_APP_TELEGRAM_API_BOT,
} = process.env || {};

export const AIPT_WEB_TOKEN = "AIPT_WEB_DBMS_TOKEN";

export const EDUCATION_LEVEL = {
  1: "12/12",
  2: "Sơ cấp",
  3: "Trung cấp",
  4: "Cao đẳng",
  5: "Đại học",
  6: "Trên đại học",
};

export const EXPERIENCE = {
  0: "Không cần kinh nghiệm",
  1: "Dưới 1 năm",
  2: "Từ 1 đến 2 năm",
  3: "Từ 2 đến dưới 3 năm",
  4: "Từ 3 đến dưới 5 năm",
  5: "Trên 5 năm",
};

export const DEFAULT_JOB_DESCRIPTION = [
  "Mô tả công việc sẽ được cập nhật bởi phòng tuyển dụng.",
];
export const DEFAULT_REQUIREMENTS = [
  "Yêu cầu sẽ được cập nhật bởi phòng tuyển dụng.",
];
export const DEFAULT_BENEFITS = [
  "Quyền lợi sẽ được cập nhật bởi phòng tuyển dụng.",
];
export const DEFAULT_WORKING_TIME = ["Thời gian làm việc sẽ được cập nhật."];

export const FILTER_ALL = "Tất cả";

const toFilterOptions = (configMap) => [
  { value: FILTER_ALL, label: FILTER_ALL },
  ...Object.entries(configMap).map(([value, label]) => ({
    value: Number(value),
    label,
  })),
];

export const EXPERIENCE_OPTIONS = toFilterOptions(EXPERIENCE);

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

export const EDUCATION_OPTIONS = toFilterOptions(EDUCATION_LEVEL);

export const isFilterAll = (value) =>
  value === FILTER_ALL || value === null || value === undefined || value === "";

export const buildCampaignListParams = ({
  name = "",
  experience = "",
  salary = FILTER_ALL,
  education = FILTER_ALL,
  pageNum = 1,
  pageSize = 100,
} = {}) => {
  const params = {
    page_num: pageNum,
    page_size: pageSize,
  };

  const trimmedName = String(name || "").trim();
  if (trimmedName) {
    params.name = trimmedName;
  }

  if (!isFilterAll(experience)) {
    params.experience = experience;
  }

  if (!isFilterAll(salary)) {
    params.salary_filter = salary;
  }

  if (!isFilterAll(education)) {
    params.education_filter = education;
  }

  return params;
};

const FIELD_CANDIDATES = {
  id: ["id", "_id", "campaign_id"],
  title: ["title", "name", "position_name", "position", "campaign_name"],
  department: ["department", "department_name", "team", "phong_ban"],
  location: ["location", "work_place", "city", "dia_diem"],
  quantity: ["quantity", "vacancy", "headcount", "so_luong"],
  deadline: [
    "end_time",
    "deadline",
    "expired_at",
    "expire_date",
    "han_tuyen_dung",
  ],
  status: ["status", "recruitment_status", "trang_thai"],
  description: [
    "jd_job_description",
    "description",
    "job_description",
    "mo_ta",
  ],
  requirements: [
    "jd_competency_requirements",
    "requirements",
    "requirement",
    "yeu_cau",
  ],
  benefits: ["jd_benefits", "benefits", "welfare", "quyen_loi"],
  salaryRange: ["jd_salary_range", "salary_range", "salary"],
  workingTime: ["working_time", "working_hours", "gio_lam_viec"],
  experience: [
    "experience",
    "experience_level",
    "experience_years",
    "kinh_nghiem",
  ],
  education: ["education_level", "education", "educationLevel", "hoc_van"],
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

const lookupLevelLabel = (value, map, fallback = "—") => {
  if (
    typeof value === "number" ||
    (typeof value === "string" && /^\d+$/.test(value))
  ) {
    const label = map[Number(value)];
    return label ?? fallback;
  }

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback;
};

export const getExperienceLabel = (value) =>
  lookupLevelLabel(value, EXPERIENCE, EXPERIENCE[0]);

export const getEducationLabel = (value) =>
  lookupLevelLabel(value, EDUCATION_LEVEL);

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
  const status = normalizeStatus(
    getFirstValue(item, FIELD_CANDIDATES.status, 1),
  );
  const salaryRange = normalizeSalaryDisplay(
    getFirstValue(item, FIELD_CANDIDATES.salaryRange, ""),
  );
  const experience = getExperienceLabel(
    getFirstValue(item, FIELD_CANDIDATES.experience, ""),
  );
  const education = getEducationLabel(
    getFirstValue(item, FIELD_CANDIDATES.education, ""),
  );

  return {
    id: getFirstValue(item, FIELD_CANDIDATES.id, `campaign-${index}`),
    title: getFirstValue(item, FIELD_CANDIDATES.title, "Vị trí đang tuyển"),
    department: getFirstValue(item, FIELD_CANDIDATES.department, "Phòng ban"),
    location: getFirstValue(item, FIELD_CANDIDATES.location, "Hà Nội"),
    quantity: String(
      getFirstValue(item, FIELD_CANDIDATES.quantity, "01"),
    ).padStart(2, "0"),
    deadline: formatDateFromUnix(
      getFirstValue(item, FIELD_CANDIDATES.deadline, ""),
    ),
    status,
    experience,
    education,
    salaryRange,
    description: toArrayText(
      getFirstValue(
        item,
        FIELD_CANDIDATES.description,
        DEFAULT_JOB_DESCRIPTION,
      ),
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

  // Axios: response.data = { success, data: [...], pagination }
  if (Array.isArray(payload.data)) {
    return payload.data;
  }

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
