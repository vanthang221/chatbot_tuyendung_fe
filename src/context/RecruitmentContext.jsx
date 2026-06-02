import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { actionGetRecruiment } from "../pages/desktop/publicDesktop/chatbot-recruiment/action";
import {
  hasCandidateInfo,
  loadCandidateFromStorage,
  saveCandidateToStorage,
} from "../pages/desktop/publicDesktop/chatbot-recruiment/candidateStorage";
import {
  buildCampaignListParams,
  extractCampaignList,
  FILTER_ALL,
  normalizeCampaign,
} from "../pages/desktop/publicDesktop/chatbot-recruiment/campaignUtils";

const RecruitmentContext = createContext(null);

export const RecruitmentProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState(FILTER_ALL);
  const [educationFilter, setEducationFilter] = useState(FILTER_ALL);
  const [candidateInfo, setCandidateInfo] = useState(() => loadCandidateFromStorage());
  const [chatStarted, setChatStarted] = useState(() =>
    hasCandidateInfo(loadCandidateFromStorage()),
  );
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [modalCampaignId, setModalCampaignId] = useState(null);
  const [messages, setMessages] = useState([]);

  const isCandidateRegistered = useMemo(
    () => hasCandidateInfo(candidateInfo),
    [candidateInfo],
  );

  const campaigns = useMemo(() => data.map(normalizeCampaign), [data]);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = buildCampaignListParams({
        name: searchName,
        experience: experienceFilter,
        salary: salaryFilter,
        education: educationFilter,
      });
      const response = await actionGetRecruiment(params);
      if (response?.status === 200) {
        setData(extractCampaignList(response.data));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [searchName, experienceFilter, salaryFilter, educationFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCampaigns();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [fetchCampaigns]);

  const openCandidateModal = useCallback((campaignId = null) => {
    if (campaignId != null) {
      setModalCampaignId(String(campaignId));
    }
    setCandidateModalOpen(true);
  }, []);

  const closeCandidateModal = useCallback(() => {
    setCandidateModalOpen(false);
  }, []);

  const saveCandidateInfo = useCallback((info) => {
    setCandidateInfo(info);
    saveCandidateToStorage(info);
  }, []);

  const startChatSession = useCallback(
    (values, campaignTitle = "") => {
      const info = {
        fullName: values.fullName?.trim() || "",
        email: values.email?.trim() || "",
        phone: values.phone?.trim() || "",
        consent: Boolean(values.consent),
      };
      saveCandidateInfo(info);
      setChatStarted(true);
      setCandidateModalOpen(false);
      setMessages([
        {
          id: Date.now(),
          from: "bot",
          text: campaignTitle
            ? `Xin chào ${info.fullName}, mình là trợ lý tuyển dụng AI. Bạn muốn hỏi gì về vị trí ${campaignTitle}?`
            : `Xin chào ${info.fullName}, mình là trợ lý tuyển dụng AI. Hãy chọn vị trí bên trái để xem chi tiết và trò chuyện.`,
        },
      ]);
    },
    [saveCandidateInfo],
  );

  const requestChatAccess = useCallback(
    (campaignId = null) => {
      if (isCandidateRegistered) {
        setChatStarted(true);
        return true;
      }
      openCandidateModal(campaignId);
      return false;
    },
    [isCandidateRegistered, openCandidateModal],
  );

  const handleSearch = () => {
    setSearchName(searchInput);
  };

  return (
    <RecruitmentContext.Provider
      value={{
        campaigns,
        loading,
        searchInput,
        setSearchInput,
        searchName,
        setSearchName,
        handleSearch,
        experienceFilter,
        setExperienceFilter,
        salaryFilter,
        setSalaryFilter,
        educationFilter,
        setEducationFilter,
        refetchCampaigns: fetchCampaigns,
        candidateInfo,
        setCandidateInfo: saveCandidateInfo,
        isCandidateRegistered,
        chatStarted,
        setChatStarted,
        candidateModalOpen,
        modalCampaignId,
        openCandidateModal,
        closeCandidateModal,
        startChatSession,
        requestChatAccess,
        messages,
        setMessages,
      }}
    >
      {children}
    </RecruitmentContext.Provider>
  );
};

export const useRecruitment = () => {
  const context = useContext(RecruitmentContext);
  if (!context) {
    throw new Error("useRecruitment must be used within RecruitmentProvider");
  }
  return context;
};
