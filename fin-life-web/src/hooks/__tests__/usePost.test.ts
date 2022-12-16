import axios, { AxiosInstance } from 'axios';
import * as chakraUiToast from '@chakra-ui/toast';
import { renderHook, act } from '@testing-library/react-hooks';

import { usePost } from '../usePost';

jest.mock('axios', () => ({
  create: jest.fn().mockReturnValue({
    post: jest.fn()
  })
}));

describe('usePost', () => {
  const mockAxiosCreate = axios.create as jest.MockedFunction<typeof axios.create>;
  const mockAxiosInstance = mockAxiosCreate.mock.results[0].value as AxiosInstance;
  const mockToast = jest.fn() as jest.MockedFunction<any>;
  const apiPath = 'https://some.api.path';
  const payload = {};

  beforeEach(() => {
    jest.spyOn(chakraUiToast, 'useToast').mockReturnValue(mockToast);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should make a successful request', async () => {
    const { result } = renderHook(() => usePost(apiPath));

    await act(async () => {
      result.current.makePostRequest(payload);
    });

    expect(mockAxiosInstance.post).toHaveBeenCalledWith(apiPath, payload);
    expect(mockToast).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBeFalsy();
  });

  it('Should catch a request exception and open a toast if there is a response message', async () => {
    const mockError = {
      response: {
        data: {
          message: "Some error message"
        }
      }
    };

    mockAxiosInstance.post = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => usePost(apiPath));

    await act(async () => {
      result.current.makePostRequest(payload);
    });

    expect(mockAxiosInstance.post).toHaveBeenCalledWith(apiPath, payload);
    expect(mockToast).toHaveBeenCalledWith({
      title: mockError.response.data.message,
      status: 'error',
      position: 'bottom-right'
    });
    expect(result.current.isLoading).toBeFalsy();
  });
});
