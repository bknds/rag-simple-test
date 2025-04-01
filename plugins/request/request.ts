interface RequestParams {
  url: string;
  data?: object;
  method?:
    | "GET"
    | "HEAD"
    | "PATCH"
    | "POST"
    | "PUT"
    | "DELETE"
    | "CONNECT"
    | "OPTIONS"
    | "TRACE";
  headers?: any;
  host?: string;
  signal?: any;
}
export const request = async <T>(params: RequestParams): Promise<T> => {
  const { url, method = "GET", data, headers, signal } = params;
  const requestParams: any = {
    method,
  };
  if (headers)
    requestParams["headers"] = { ...requestParams["headers"], ...headers };

  if (signal)
    requestParams["signal"] = signal;
  if (/get/i.test(method)) requestParams["params"] = data;
  if (/post/i.test(method)) requestParams["body"] = JSON.stringify(data);
  try {
    const fetchFn = signal?fetch:$fetch;
    const res = await fetchFn(url, {
      server: false,
      ...requestParams,
    });
    return res as T;
  } catch (error: any) {
    return await Promise.reject(error);
  }
};
