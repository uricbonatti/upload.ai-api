import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { createReadStream, writeFileSync } from "node:fs";
import { openai } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post("/videos/:videoId/transcription", async (req) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    });

    const { videoId } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      prompt: z.string(),
    });
    const { prompt } = bodySchema.parse(req.body);

    console.log("prompt", prompt);
    console.log("videoId", videoId);

    const video = await prisma.video.findUniqueOrThrow({
      where: { id: videoId },
    });

    const videoPath = video.path;
    console.log("videoPath", videoPath);

    const audioReadStream = createReadStream(videoPath);

    console.log("audioReadStrem criada");
    try {
      const response = await openai.audio.transcriptions.create(
        {
          file: audioReadStream,
          model: "whisper-1",
          language: "pt",
          response_format: "json",
          temperature: 0.1,
          prompt,
        },
        { timeout: 180000, maxRetries: 2 }
      );

      const transcription = response.text;

      await prisma.video.update({
        where: { id: videoId },
        data: {
          transcription,
        },
      });

      return { transcription };
    } catch (error) {
      console.log(error);
      throw error;
    }
  });
}
