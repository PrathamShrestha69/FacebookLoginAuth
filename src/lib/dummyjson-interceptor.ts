type RequestInterceptor = (request: { url: string; init: RequestInit }) => {
  url: string;
  init: RequestInit;
};

type ResponseInterceptor = (response: Response) => Response;

export type InterceptorTrace = {
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };
  response?: {
    status: number;
    ok: boolean;
  };
  error?: string;
};

class FetchInterceptorClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  useRequest(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
  }

  useResponse(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
  }

  async request<T>(url: string, init: RequestInit = {}) {
    let processed = { url, init };
    for (const interceptor of this.requestInterceptors) {
      processed = interceptor(processed);
    }

    const trace: InterceptorTrace = {
      request: {
        url: processed.url,
        method: (processed.init.method ?? "GET").toUpperCase(),
        headers: headersToObject(new Headers(processed.init.headers ?? {})),
      },
    };

    let response = await fetch(processed.url, processed.init);
    for (const interceptor of this.responseInterceptors) {
      response = interceptor(response);
    }

    trace.response = {
      status: response.status,
      ok: response.ok,
    };

    if (!response.ok) {
      const errText = await response.text();
      trace.error = errText;
      throw new Error(`DummyJSON auth failed: ${response.status} ${errText}`);
    }

    const data = (await response.json()) as T;
    return { data, trace };
  }
}

function headersToObject(headers: Headers) {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key] = value;
  });
  return out;
}

type DummyJsonLoginResponse = {
  accessToken: string;
  refreshToken: string;
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
};

export async function loginWithDummyJson(
  username = "emilys",
  password = "emilyspass",
) {
  const client = new FetchInterceptorClient();

  client.useRequest(({ url, init }) => {
    const headers = new Headers(init.headers ?? {});
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set("X-Interceptor", "dummyjson-auth");
    return {
      url,
      init: {
        ...init,
        headers,
      },
    };
  });

  client.useResponse((response) => response);

  return client.request<DummyJsonLoginResponse>(
    "https://dummyjson.com/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        expiresInMins: 30,
      }),
      cache: "no-store",
    },
  );
}
