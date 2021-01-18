import * as jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { getUser } from "@app/services/user";
import { NotFoundError, handleError } from "@app/data/util";
import { UNAUTHORIZED } from "http-status-codes";

dotenv.config();

/**
 * Generate token based on payload.
 */
export function seal(data: any, secret: string, ttl: number | string): Promise<string> {
  const expiresIn = typeof ttl === "number" ? `${ttl}s` : ttl;
  return new Promise((resolve, reject) => {
    const claim = data.toJSON ? data.toJSON() : data;
    jwt.sign({ claim }, secret, { expiresIn }, (err, sig) => {
      if (err) return reject(err);
      resolve(sig);
    });
  });
}

/**
 * Verifies user provided token
 */
export function unseal(token: string, secret: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, val) => {
      if (err) return reject(err);
      return resolve(val["claim"]);
    });
  });
}

export async function secure(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return null;
    }

    const claim = await unseal(token, process.env.secret_key);

    const user = await getUser(claim["id"]);

    if (!user) {
      throw new NotFoundError("User not found");
    }
    req.user = claim;
    return next();
  } catch (error) {
    return handleError(req, res, error.message, UNAUTHORIZED);
  }
}

declare global {
  namespace Express {
    export interface Request {
      user: any;
    }
  }
}
