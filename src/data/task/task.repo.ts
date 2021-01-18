import { connection } from "mongoose";
import { Task } from "./task.model";
import { TaskSchema } from "./task.schema";
import { BaseRepository } from "../database";

class TaskRepository extends BaseRepository<Task> {
  constructor() {
    super(connection, "Tasks", TaskSchema);
  }
}

export const TaskRepo = new TaskRepository();
