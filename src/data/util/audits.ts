import { Request } from "express";

export interface ActionLog {
  activity: string;
  message: string;
  object_id: string;
}

class AuditService {
  log(req: Request, action: ActionLog) {
    const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    return {
      activity: action.activity,
      message: action.message,
      object_id: action.object_id,
      ip_address: ipAddr
    };
  }
}

export const Audits = new AuditService();
