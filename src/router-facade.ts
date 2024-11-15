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
import type { routerProviderSettings } from "./router-provider";

/**
@deprecated Use `createrouter` instead.
 */
export class router {
  /**
Use a different URL prefix for API calls, e.g. to use proxy servers.
The default prefix is `https://1router.com/api/v1`.
   */
  readonly baseURL: string;

  /**
API key that is being send using the `Authorization` header.
It defaults to the `router_API_KEY` environment variable.
 */
  readonly apiKey?: string;

  /**
Custom headers to include in the requests.
   */
  readonly headers?: Record<string, string>;

  /**
   * Creates a new router provider instance.
   */
  constructor(options: routerProviderSettings = {}) {
    this.baseURL =
      withoutTrailingSlash(options.baseURL ?? options.baseUrl) ??
      "https://1router.com/api/v1";
    this.apiKey = options.apiKey;
    this.headers = options.headers;
  }

  private get baseConfig() {
    return {
      baseURL: this.baseURL,
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: this.apiKey,
          environmentVariableName: "router_API_KEY",
          description: "router",
        })}`,
        ...this.headers,
      }),
    };
  }

  chat(modelId: routerChatModelId, settings: routerChatSettings = {}) {
    return new routerChatLanguageModel(modelId, settings, {
      provider: "router.chat",
      ...this.baseConfig,
      compatibility: "strict",
      url: ({ path }) => `${this.baseURL}${path}`,
    });
  }

  completion(
    modelId: routerCompletionModelId,
    settings: routerCompletionSettings = {}
  ) {
    return new routerCompletionLanguageModel(modelId, settings, {
      provider: "router.completion",
      ...this.baseConfig,
      compatibility: "strict",
      url: ({ path }) => `${this.baseURL}${path}`,
    });
  }
}
