import { IncomingHttpHeaders } from "http";

export const toHeaders = (headers: IncomingHttpHeaders) => {
  const h = new Headers();

  Object.entries(headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => h.append(key, v));
    } else if (value !== undefined) {
      h.append(key, String(value));
    }
  });

  return h;
};
