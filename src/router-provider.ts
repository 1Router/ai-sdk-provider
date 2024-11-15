import { loadApiKey, withoutTrailingSlash } from "@ai-sdk/provider-utils";
import { routerChatLanguageModel } from "./router-chat-language-model";
import type {
  routerChatModelId,
  routerChatSettings,
} from "./router-chat-settings";
import { routerCompletionLanguageModel } from "./router-completion-language-model";
import type {
  routerCompletionModelId,
  routerCompletionSettings,
} from "./router-completion-settings";

export interface routerProvider {
  (
    modelId: "openai/gpt-3.5-turbo-instruct",
    settings?: routerCompletionSettings
  ): routerCompletionLanguageModel;
  (
    modelId: routerChatModelId,
    settings?: routerChatSettings
  ): routerChatLanguageModel;

  languageModel(
    modelId: "openai/gpt-3.5-turbo-instruct",
    settings?: routerCompletionSettings
  ): routerCompletionLanguageModel;
  languageModel(
    modelId: routerChatModelId,
    settings?: routerChatSettings
  ): routerChatLanguageModel;

  /**
Creates an router chat model for text generation.
   */
  chat(
    modelId: routerChatModelId,
    settings?: routerChatSettings
  ): routerChatLanguageModel;

  /**
Creates an router completion model for text generation.
   */
  completion(
    modelId: routerCompletionModelId,
    settings?: routerCompletionSettings
  ): routerCompletionLanguageModel;
}

export interface routerProviderSettings {
  /**
Base URL for the router API calls.
     */
  baseURL?: string;

  /**
@deprecated Use `baseURL` instead.
     */
  baseUrl?: string;

  /**
API key for authenticating requests.
     */
  apiKey?: string;

  /**
Custom headers to include in the requests.
     */
  headers?: Record<string, string>;

  /**
router compatibility mode. Should be set to `strict` when using the router API,
and `compatible` when using 3rd party providers. In `compatible` mode, newer
information such as streamOptions are not being sent. Defaults to 'compatible'.
   */
  compatibility?: "strict" | "compatible";

  /**
Custom fetch implementation. You can use it as a middleware to intercept requests,
or to provide a custom fetch implementation for e.g. testing.
    */
  fetch?: typeof fetch;

  /**
A JSON object to send as the request body to access router features & upstream provider features.
  */
  extraBody?: Record<string, unknown>;
}

/**
Create an router provider instance.
 */
export function createrouter(
  options: routerProviderSettings = {}
): routerProvider {
  const baseURL =
    withoutTrailingSlash(options.baseURL ?? options.baseUrl) ??
    "https://1router.com/api/v1";

  // we default to compatible, because strict breaks providers like Groq:
  const compatibility = options.compatibility ?? "compatible";

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: "router_API_KEY",
      description: "router",
    })}`,
    ...options.headers,
  });

  const createChatModel = (
    modelId: routerChatModelId,
    settings: routerChatSettings = {}
  ) =>
    new routerChatLanguageModel(modelId, settings, {
      provider: "router.chat",
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      compatibility,
      fetch: options.fetch,
      extraBody: options.extraBody,
    });

  const createCompletionModel = (
    modelId: routerCompletionModelId,
    settings: routerCompletionSettings = {}
  ) =>
    new routerCompletionLanguageModel(modelId, settings, {
      provider: "router.completion",
      url: ({ path }) => `${baseURL}${path}`,
      headers: getHeaders,
      compatibility,
      fetch: options.fetch,
      extraBody: options.extraBody,
    });

  const createLanguageModel = (
    modelId: routerChatModelId | routerCompletionModelId,
    settings?: routerChatSettings | routerCompletionSettings
  ) => {
    if (new.target) {
      throw new Error(
        "The router model function cannot be called with the new keyword."
      );
    }

    if (modelId === "openai/gpt-3.5-turbo-instruct") {
      return createCompletionModel(
        modelId,
        settings as routerCompletionSettings
      );
    }

    return createChatModel(modelId, settings as routerChatSettings);
  };

  const provider = function (
    modelId: routerChatModelId | routerCompletionModelId,
    settings?: routerChatSettings | routerCompletionSettings
  ) {
    return createLanguageModel(modelId, settings);
  };

  provider.languageModel = createLanguageModel;
  provider.chat = createChatModel;
  provider.completion = createCompletionModel;

  return provider as routerProvider;
}

/**
Default router provider instance. It uses 'strict' compatibility mode.
 */
export const router = createrouter({
  compatibility: "strict", // strict for router API
});
