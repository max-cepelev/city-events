<script lang="ts">
  import { resolve } from "$app/paths";

  import { formatCardDate, formatEventPrice } from "$lib/format";
  import type { EventListItem } from "$lib/types";

  import Icon from "./Icon.svelte";

  interface Props {
    event: EventListItem;
  }

  let { event }: Props = $props();
</script>

<article class="event-card">
  <a
    class="image-link"
    href={resolve("/events/[slug]", { slug: event.slug })}
    tabindex="-1"
    aria-hidden="true"
  >
    <div class="image-wrap">
      <img src={event.image.url} alt={event.image.alt} loading="lazy" />
      <span class="badge">{event.category.name}</span>
    </div>
  </a>
  <div class="meta">
    <span class="date">{formatCardDate(event)}</span>
    <span class="price" class:free={event.price.kind === "free"}>
      {formatEventPrice(event.price)}
    </span>
  </div>
  <h3 class="title">
    <a href={resolve("/events/[slug]", { slug: event.slug })}>{event.title}</a>
  </h3>
  {#if event.venue !== null}
    <p class="place">
      <Icon name="pin" size={15} />
      {event.venue.name}
    </p>
  {/if}
</article>

<style>
  .event-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }

  .image-link {
    display: block;
  }

  .image-wrap {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-sm);
    aspect-ratio: 16 / 10;
    background: var(--surface-secondary);
  }

  .image-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.35s ease;
  }

  .event-card:hover .image-wrap img {
    transform: scale(1.03);
  }

  .badge {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 7px 9px;
    border-radius: var(--radius-sm);
    background: rgb(245 242 233 / 93%);
    font-family: var(--font-data);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .meta {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--space-s);
    font-family: var(--font-data);
    font-size: 11px;
  }

  .date {
    color: var(--accent-primary);
  }

  .price {
    color: var(--foreground-secondary);
  }

  .price.free {
    color: var(--success);
  }

  .title {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 26px;
    font-weight: 500;
    line-height: 1.15;
  }

  .title a {
    transition: color 0.15s ease;
  }

  .title a:hover {
    color: var(--accent-primary);
  }

  .place {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    color: var(--foreground-secondary);
    font-size: 13px;
  }
</style>
