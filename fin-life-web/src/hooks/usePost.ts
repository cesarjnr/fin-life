import axios from "axios";
import { useState } from "react";
import { useToast } from "@chakra-ui/toast";

interface UsePost {
  makePostRequest: <T>(payload: T) => void;
  isLoading: boolean;
};

const api = axios.create({ baseURL: process.env.REACT_APP_API_BASE_URL });

export const usePost = (
  path: string
): UsePost => {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const makePostRequest = async <U>(payload: U) => {
    try {
      setIsLoading(true);

      await api.post(path, payload);
    } catch (error: any) {
      if (error.response) {
        toast({
          title: error.response.data.message,
          status: 'error',
          position: 'bottom-right'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { makePostRequest, isLoading };
};
