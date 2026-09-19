import { Queue, type QueueOptions } from "bullmq";
import { Redis } from "ioredis";

export const queueNames = {
  eventProcessing: "event-processing",
  eventPublication: "event-publication",
  maintenance: "maintenance",
  notifications: "notifications",
  sourceCrawl: "source-crawl"
} as const;

export type QueueName = (typeof queueNames)[keyof typeof queueNames];

export interface RedisConnectionOptions {
  readonly connectionName: string;
  readonly url: string;
}

export function createQueueConnection(options: RedisConnectionOptions): Redis {
  return new Redis(options.url, {
    connectionName: options.connectionName,
    lazyConnect: true,
    maxRetriesPerRequest: null
  });
}

export function createQueue(
  name: QueueName,
  connection: Redis,
  options: Omit<QueueOptions, "connection"> = {}
): Queue {
  return new Queue(name, { ...options, connection });
}
