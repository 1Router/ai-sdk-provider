type routerCompletionLogProps = {
  tokens: string[];
  token_logprobs: number[];
  top_logprobs: Record<string, number>[] | null;
};

export function maprouterCompletionLogProbs(
  logprobs: routerCompletionLogProps | null | undefined
) {
  return logprobs?.tokens.map((token, index) => ({
    token,
    logprob: logprobs.token_logprobs[index] ?? 0,
    topLogprobs: logprobs.top_logprobs
      ? Object.entries(logprobs.top_logprobs[index] ?? {}).map(
          ([token, logprob]) => ({
            token,
            logprob,
          })
        )
      : [],
  }));
}