export interface RawEvent {
  readonly externalId?: string;
  readonly externalUrl?: string;
  readonly payload: unknown;
}

export interface SourceContext {
  readonly cityId: string;
  readonly signal: AbortSignal;
  readonly sourceId: string;
}

export interface EventSourceAdapter {
  readonly key: string;
  fetchEvents(context: SourceContext): AsyncIterable<RawEvent>;
}
