import api from "./axiosConfig";

export const sendCompanionMessage = async (message, history = []) => {
  const response = await api.post("/assist", {
    mode: "COMPANION_CHAT",
    history,
    message,
  });

  return response.data;
};
