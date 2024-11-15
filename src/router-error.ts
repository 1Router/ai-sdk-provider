import { z } from "zod";
import { createJsonErrorResponseHandler } from "@ai-sdk/provider-utils";

export const openAIErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string(),
    param: z.any().nullable(),
    code: z.string().nullable(),
  }),
});

export type routerErrorData = z.infer<typeof openAIErrorDataSchema>;

export const routerFailedResponseHandler = createJsonErrorResponseHandler({
  errorSchema: openAIErrorDataSchema,
  errorToMessage: (data) => data.error.message,
});
