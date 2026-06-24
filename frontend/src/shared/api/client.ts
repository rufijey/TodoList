const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CustomRequestConfig {
  headers?: Record<string, string>;
}

const defaults = {
  headers: {
    common: {
      Authorization: '',
    },
  },
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const request = async (method: string, url: string, bodyData?: any, config?: CustomRequestConfig): Promise<any> => {
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config?.headers,
  };

  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (defaults.headers.common.Authorization) {
    headers['Authorization'] = defaults.headers.common.Authorization;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (bodyData !== undefined) {
    options.body = JSON.stringify(bodyData);
  }

  let response: Response;
  try {
    response = await fetch(fullUrl, options);
  } catch (fetchError) {
    throw {
      response: {
        status: 0,
        data: { message: 'Network error or request blocked' }
      }
    };
  }

  if (response.status === 401 && !url.includes('/users/refresh')) {
    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(async (newToken) => {
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          };
          const retryRes = await fetch(fullUrl, { ...options, headers: retryHeaders });
          if (!retryRes.ok) {
            let errData: any = {};
            try {
              errData = await retryRes.json();
            } catch (_) {}
            throw {
              response: {
                status: retryRes.status,
                data: errData
              }
            };
          }
          let resData: any = {};
          try {
            resData = await retryRes.json();
          } catch (_) {}
          return { data: resData };
        })
        .catch((err) => {
          throw err;
        });
    }

    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      isRefreshing = false;
      window.dispatchEvent(new Event('auth-logout'));
      throw {
        response: {
          status: 401,
          data: { message: 'No refresh token available' }
        }
      };
    }

    try {
      const refreshRes = await fetch(`${API_URL}/users/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!refreshRes.ok) {
        throw new Error('Refresh failed');
      }

      const refreshData = await refreshRes.json();
      const { accessToken: newAt, refreshToken: newRt } = refreshData;

      localStorage.setItem('accessToken', newAt);
      localStorage.setItem('refreshToken', newRt);

      defaults.headers.common.Authorization = `Bearer ${newAt}`;
      
      processQueue(null, newAt);
      isRefreshing = false;

      const retryHeaders = {
        ...headers,
        'Authorization': `Bearer ${newAt}`,
      };
      const retryRes = await fetch(fullUrl, { ...options, headers: retryHeaders });
      if (!retryRes.ok) {
        let errData: any = {};
        try {
          errData = await retryRes.json();
        } catch (_) {}
        throw {
          response: {
            status: retryRes.status,
            data: errData
          }
        };
      }
      let resData: any = {};
      try {
        resData = await retryRes.json();
      } catch (_) {}
      return { data: resData };
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('auth-logout'));
      throw {
        response: {
          status: 401,
          data: { message: 'Session expired' }
        }
      };
    }
  }

  if (!response.ok) {
    let errData: any = {};
    try {
      errData = await response.json();
    } catch (_) {}
    throw {
      response: {
        status: response.status,
        data: errData
      }
    };
  }

  let resData: any = {};
  try {
    resData = await response.json();
  } catch (_) {}
  return { data: resData };
};

const client = {
  defaults,
  get: (url: string, config?: CustomRequestConfig): Promise<any> => request('GET', url, undefined, config),
  post: (url: string, data?: any, config?: CustomRequestConfig): Promise<any> => request('POST', url, data, config),
  patch: (url: string, data?: any, config?: CustomRequestConfig): Promise<any> => request('PATCH', url, data, config),
  delete: (url: string, config?: CustomRequestConfig): Promise<any> => request('DELETE', url, undefined, config),
};

export default client;
