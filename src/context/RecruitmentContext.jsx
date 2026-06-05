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
  const [experienceFilter, setExperienceFilter] = useState(FILTER_ALL);
  const [salaryFilter, setSalaryFilter] = useState(FILTER_ALL);
  const [educationFilter, setEducationFilter] = useState(FILTER_ALL);
  const [candidateInfo, setCandidateInfo] = useState(() => loadCandidateFromStorage());
  const [chatStarted, setChatStarted] = useState(() =>
    hasCandidateInfo(loadCandidateFromStorage()),
  );
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [modalCampaignId, setModalCampaignId] = useState(null);
  const [messagesByCampaign, setMessagesByCampaign] = useState({});
  const [openChatCampaignIds, setOpenChatCampaignIds] = useState([]);
  const [activeChatCampaignId, setActiveChatCampaignId] = useState(null);

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

  const openChatCampaign = useCallback((campaignId) => {
    if (campaignId == null || campaignId === "") return null;

    const id = String(campaignId);

    setOpenChatCampaignIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
    setActiveChatCampaignId(id);
    setChatStarted(true);

    return id;
  }, []);

  const closeChatCampaign = useCallback((campaignId) => {
    if (campaignId == null || campaignId === "") return null;

    const id = String(campaignId);
    let nextActiveId = null;

    setOpenChatCampaignIds((prev) => {
      const next = prev.filter((item) => item !== id);
      nextActiveId = next[next.length - 1] ?? null;
      return next;
    });

    setActiveChatCampaignId((current) => {
      if (current !== id) return current;
      return nextActiveId;
    });

    return nextActiveId;
  }, []);

  const activateChatCampaign = useCallback((campaignId) => {
    if (campaignId == null || campaignId === "") return null;

    const id = String(campaignId);
    setOpenChatCampaignIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveChatCampaignId(id);

    return id;
  }, []);

  const closeCandidateModal = useCallback(() => {
    setCandidateModalOpen(false);
  }, []);

  const saveCandidateInfo = useCallback((info) => {
    setCandidateInfo(info);
    saveCandidateToStorage(info);
  }, []);

  const getMessagesForCampaign = useCallback(
    (campaignId) => messagesByCampaign[String(campaignId)] ?? [],
    [messagesByCampaign],
  );

  const setMessagesForCampaign = useCallback((campaignId, updater) => {
    const key = String(campaignId);
    setMessagesByCampaign((prev) => ({
      ...prev,
      [key]: typeof updater === "function" ? updater(prev[key] ?? []) : updater,
    }));
  }, []);

  const startChatSession = useCallback(
    (values) => {
      const info = {
        fullName: values.fullName?.trim() || "",
        email: values.email?.trim() || "",
        phone: values.phone?.trim() || "",
        consent: Boolean(values.consent),
      };
      saveCandidateInfo(info);
      setChatStarted(true);
      setCandidateModalOpen(false);
    },
    [saveCandidateInfo],
  );

  const requestChatAccess = useCallback(
    (campaignId = null) => {
      if (isCandidateRegistered) {
        if (campaignId != null && campaignId !== "") {
          openChatCampaign(campaignId);
        } else {
          setChatStarted(true);
        }
        return true;
      }
      openCandidateModal(campaignId);
      return false;
    },
    [isCandidateRegistered, openCandidateModal, openChatCampaign],
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
        openChatCampaignIds,
        activeChatCampaignId,
        openChatCampaign,
        closeChatCampaign,
        activateChatCampaign,
        candidateModalOpen,
        modalCampaignId,
        openCandidateModal,
        closeCandidateModal,
        startChatSession,
        requestChatAccess,
        getMessagesForCampaign,
        setMessagesForCampaign,
        messagesByCampaign,
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
