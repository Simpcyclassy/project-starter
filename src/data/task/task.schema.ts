import { SchemaFactory } from "../database";
import { trimmedString } from "../util/schema";
import { TaskState } from "./task.model";

export const TaskSchema = SchemaFactory({
  description: { ...trimmedString, required: true, index: true },
  state: { ...trimmedString, required: true, index: true, default: TaskState.Todo },
  user_id: { ...trimmedString, required: true, index: true }
});
