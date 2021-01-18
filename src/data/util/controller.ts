import { Query, Audits, ActionLog } from "@app/data/util";
import { Request, Response } from "express";
import { injectable, unmanaged } from "inversify";
import pick from "lodash/pick";
import Logger = require("bunyan");
import { Log } from "../../common/services/log";

@injectable()
export class Controller<T> {
  constructor(@unmanaged() private logger: Logger) {}

  /**
   * Handles operation success and sends a HTTP response.
   * __Note__: if the data passed is a promise, no value is sent
   * until the promise resolves.
   * @param req Express request
   * @param res Express response
   * @param result Success data
   */
  async handleSuccess(req: Request, res: Response, result: T) {
    res.json({
      status: "success",
      data: result
    });
    this.logger.info({ req, res });
  }

  /**
   * Picks relevant pagination options from an Express query object
   * @param query Express Query object
   */
  getPaginationOptions(query: any): PaginationOptions {
    return pick(query, ["page", "per_page", "projections", "sort"]);
  }
}

export type PaginationOptions = Pick<Query, Exclude<keyof Query, "conditions" | "archived">>;

export class BaseController<T> extends Controller<T> {
  constructor() {
    super(Log);
  }

  log(req: Request, action: ActionLog) {
    return Audits.log(req, action);
  }
}
