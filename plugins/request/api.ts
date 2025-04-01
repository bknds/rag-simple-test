import { request } from "./request";
const useAPI = () => {
  const addQAData = async (data: { qaDataList: IQAData[] }) => {
    return await request<{ message: string }>({
      url: "/api/upload",
      method: "POST",
      data,
    });
  };

  const history = async (data: { page: number }) => {
    return await request<IChatMessage[]>({
      url: "/api/history",
      data,
    });
  };

  const chat = async (data: { question: string }) => {
    const controller = new AbortController();
    return await request<any>({
      url: "/api/chat",
      method: "POST",
      data,
      signal: controller.signal,
    });
  };

  return {
    addQAData,
    history,
    chat
  };
};

export default useAPI;
