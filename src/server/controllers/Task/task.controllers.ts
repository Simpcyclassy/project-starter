import {
  controller,
  httpPost,
  requestBody,
  request,
  response,
  httpGet,
  requestParam,
  httpDelete,
  httpPatch
} from "inversify-express-utils";
import { Request, Response } from "express";
import { Task, TaskDTO } from "@app/data/task";
import { BaseController, UnAuthorisedError } from "@app/data/util";
import { TaskRepo } from "@app/data/task";
import { validate } from "@app/data/util"
import { TaskService } from "@app/services/task";
import { isID } from "./task.validator";
import { secure } from "@app/common/services"
import { TaskState } from "@app/data/task"
import { isTask } from "./task.validator";

type ControllerResponse = Task | Task[] | string;

@controller("/tasks")
export class UserTaskController extends BaseController<ControllerResponse> {
  @httpPost("/", secure, validate(isTask))
  async createUserTask(
    @request() req: Request,
    @response() res: Response,
    @requestBody() body: Task
  ) {
    const task = await TaskService.createTask(body, req.user["id"]);

    this.handleSuccess(req, res, task);

    this.log(req, {
      activity: "create.task",
      message: "New created task",
      object_id: task.id
    });
  }

  @httpGet("/:id", secure, validate(isID))
  async getTask(
    @request() req: Request,
    @response() res: Response,
    @requestParam("id") id: string
  ) {
    const task = await TaskRepo.byID(id);

    if(task.user_id !== req.user.id){
      throw new UnAuthorisedError("You are not authorised")
    }
    this.handleSuccess(req, res, task);
  }

  @httpGet("/", secure)
  async getAllTasks(
    @request() req: Request,
    @response() res: Response
  ) {
    const user = await TaskRepo.all({
      conditions: {
        user_id: { $eq: req.user.id }
      },
      sort: "+created_at"
    });
    this.handleSuccess(req, res, user);
  }

  @httpDelete("/:id", secure, validate(isID))
  async deleteTask(
    @request() req: Request,
    @response() res: Response,
    @requestParam("id") id: string
  ) {
    const task = await TaskRepo.byID(id);

    if(task.user_id !== req.user.id){
      throw new UnAuthorisedError("You are not authorised")
    }

    const deletedTask = await TaskRepo.destroy(id);

    this.handleSuccess(req, res, deletedTask);
  }

  @httpPatch("/:id", secure, validate(isID), validate(isTask))
  async updateTask(
    @request() req: Request,
    @response() res: Response,
    @requestParam("id") id: string,
    @requestBody() body: TaskDTO
  ) {
    const task = await TaskRepo.byID(id);

    if(task.user_id !== req.user.id){
      throw new UnAuthorisedError("You are not authorised")
    }

    if(task.state === TaskState.Done){
      throw new UnAuthorisedError("You can not edit a completed Task")
    }
    const update: any = {
      description: body.description,
    };

    const updatedTask = await TaskRepo.atomicUpdate(id, update);
    this.handleSuccess(req, res, updatedTask);
  }

  @httpPatch("/:id/done", secure, validate(isID))
  async markTaskAsDone(
    @request() req: Request,
    @response() res: Response,
    @requestParam("id") id: string
  ) {
    const task = await TaskRepo.byID(id);

    if(task.user_id !== req.user.id){
      throw new UnAuthorisedError("You are not authorised")
    }
    const update: any = {
      state: TaskState.Done
    };

    const doneTask = await TaskRepo.atomicUpdate(id, update);
    this.handleSuccess(req, res, doneTask);
  }
}
