import { fastify } from "fastify";
import { getAllPromptsRoute } from "./routes/get-all-prompts";
import { uploadVideoRoute } from "./routes/upload-video";
import { createTranscriptionRoute } from "./routes/create-transcription";
import { generateAICoompletionRoute } from "./routes/generate-ai-completion";
import fastifyCors from "@fastify/cors";

const app = fastify();

app.register(fastifyCors, {
  origin: "*",
});

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateAICoompletionRoute);

app.server.keepAliveTimeout = 360000;
app.listen({ port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});
