import {
  livenessResponseSchema,
  readinessResponseSchema,
  type LivenessResponse,
  type ReadinessResponse
} from "@city-events/shared";

export interface ApiClientOptions {
  readonly baseUrl?: string;
  readonly fetch?: typeof globalThis.fetch;
}

export interface ApiClient {
  getLiveness(): Promise<LivenessResponse>;
  getReadiness(): Promise<ReadinessResponse>;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const request = options.fetch ?? globalThis.fetch;
  const baseUrl = options.baseUrl?.replace(/\/$/u, "") ?? "";

  async function getJson(path: string): Promise<unknown> {
    const response = await request(`${baseUrl}${path}`, {
      headers: { accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`City Events API returned HTTP ${response.status}`);
    }

    return response.json();
  }

  return {
    async getLiveness() {
      return livenessResponseSchema.parse(await getJson("/health/live"));
    },
    async getReadiness() {
      return readinessResponseSchema.parse(await getJson("/health/ready"));
    }
  };
}
