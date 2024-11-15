import { streamText } from "ai";
import { createrouter } from "@router/ai-sdk-provider";
import { z } from "zod";

export const getLasagnaRecipe = async (modelName: string) => {
  const router = createrouter({
    apiKey: process.env.router_API_KEY,
  });

  const result = await streamText({
    model: router(modelName),
    prompt: "Write a vegetarian lasagna recipe for 4 people.",
  });
  return result.toAIStreamResponse();
};

export const getWeather = async (modelName: string) => {
  const router = createrouter({
    apiKey: process.env.router_API_KEY,
  });

  const result = await streamText({
    model: router(modelName),
    prompt: "What is the weather in San Francisco, CA in Fahrenheit?",
    tools: {
      getCurrentWeather: {
        description: "Get the current weather in a given location",
        parameters: z.object({
          location: z
            .string()
            .describe("The city and state, e.g. San Francisco, CA"),
          unit: z.enum(["celsius", "fahrenheit"]).optional(),
        }),
        execute: async ({ location, unit = "celsius" }) => {
          // Mock response for the weather
          const weatherData = {
            "Boston, MA": {
              celsius: "15°C",
              fahrenheit: "59°F",
            },
            "San Francisco, CA": {
              celsius: "18°C",
              fahrenheit: "64°F",
            },
          };

          const weather = weatherData[location];
          if (!weather) {
            return `Weather data for ${location} is not available.`;
          }

          return `The current weather in ${location} is ${weather[unit]}.`;
        },
      },
    },
  });
  return result.toAIStreamResponse();
};
