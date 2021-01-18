import { createRequestSerializer, errSerializer, resSerializer } from "@app/data/util";
import Logger, { createLogger } from "bunyan";
import dotenv from "dotenv";

dotenv.config();

export const Log: Logger = createLogger({
  name: process.env.service_name,
  serializers: {
    err: errSerializer,
    res: resSerializer,
    req: createRequestSerializer("password")
  }
});
