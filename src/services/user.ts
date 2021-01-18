import axios from "axios";
import dotenv from "dotenv";
import { ServerError } from "@app/data/util";

dotenv.config()

export async function getUser(id: string) {
  try {
    const user = await axios.get(`${process.env.users_url}/user/${id}`, {
      timeout: 30000
    });
    return user
  } catch (error) {
    console.log(error)
    throw new ServerError("We could not complete this request, please try again")
  }
}
