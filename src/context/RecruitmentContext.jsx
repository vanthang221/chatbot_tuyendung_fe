import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { actionGetRecruiment } from "../pages/desktop/publicDesktop/chatbot-recruiment/action";
import {
  extractCampaignList,
  matchesSalaryFilter,
  normalizeCampaign,
} from "../pages/desktop/publicDesktop/chatbot-recruiment/campaignUtils";

const RecruitmentContext = createContext(null);

export const RecruitmentProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [salaryFilter, setSalaryFilter] = useState("Tất cả");
  const [candidateInfo, setCandidateInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    consent: true,
  });
  const [messages, setMessages] = useState([]);

  const campaigns = useMemo(() => data.map(normalizeCampaign), [data]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((item) => {
      const matchExperience = !experienceFilter || item.experience === experienceFilter;
      const matchSalary = matchesSalaryFilter(item.salaryRange, salaryFilter);
      return matchExperience && matchSalary;
    });
  }, [campaigns, experienceFilter, salaryFilter]);

  const fetchCampaigns = async (name = "") => {
    try {
      const params = name.trim() ? { name: name.trim() } : undefined;
      const response = await actionGetRecruiment(params);
      const { data: responseData, status } = response || {};
      if (status === 200) {
        setData(extractCampaignList(responseData));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCampaigns(searchName);
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchName]);

  const handleSearch = () => {
    setSearchName(searchInput);
  };

  return (
    <RecruitmentContext.Provider
      value={{
        campaigns,
        filteredCampaigns,
        searchInput,
        setSearchInput,
        searchName,
        setSearchName,
        handleSearch,
        experienceFilter,
        setExperienceFilter,
        salaryFilter,
        setSalaryFilter,
        candidateInfo,
        setCandidateInfo,
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
