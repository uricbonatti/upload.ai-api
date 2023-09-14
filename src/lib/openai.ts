import "dotenv/config";
import { OpenAI } from "openai";

console.log(process.env.OPENAI_API_KEY);

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
