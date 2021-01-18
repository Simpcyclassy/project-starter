import Logger from "bunyan";
import { Request, Response } from "express";

function removeSensitiveData(body: any, props: string[]) {
  const allKeys = Object.keys(body);
  const permittedKeys = allKeys.filter(k => props.indexOf(k) === -1);

  return permittedKeys.reduce((payload, k) => {
    payload[k] = body[k];
    return payload;
  }, {});
}

/**
 * Create a function that serializes an Express request
 * for Bunyan logging
 * @param sensitiveProps key names of sensitive properties
 */
export function createRequestSerializer(...sensitiveProps: string[]): (req: Request) => object {
  return (req: Request) => {
    if (!req || !req.connection) return req;

    return {
      method: req.method,
      url: req.url,
      headers: req.headers,
      origin_service: req.headers["x-origin-service"],
      remoteAddress: req.connection.remoteAddress,
      remotePort: req.connection.remotePort,
      // @ts-ignore
      id: req.id,
      ...(req.body && Object.keys(req.body).length !== 0
        ? { body: removeSensitiveData(req.body, sensitiveProps) }
        : undefined)
    };
  };
}

/**
 * Serializes an Express response for Bunyan logging
 * @param res Express response object
 */
export const resSerializer = (res: Response) => {
  if (!res || !res.statusCode) return res;
  return {
    statusCode: res.statusCode,
    // @ts-ignore
    headers: res._headers,
    // @ts-ignore
    body: res.body
  };
};

/**
 * Extends the standard bunyan error serializer and allows custom fields to be added to the error log
 */
export const errSerializer = (err: any) => {
  const { url, data, req, response, config } = err;
  const bunyanSanitizedError = Logger.stdSerializers.err(err);
  return {
    ...bunyanSanitizedError,
    url,
    data,
    req,
    config,
    ...(response &&
      typeof response === "object" && {
        response: {
          config: response.config,
          data: response.data,
          status: response.status
        }
      })
  };
};
