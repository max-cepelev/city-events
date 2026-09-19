<script lang="ts">
  import { resolve } from "$app/paths";

  import Icon from "$lib/components/Icon.svelte";
  import OccurrenceList from "$lib/components/OccurrenceList.svelte";
  import {
    formatDayMonth,
    formatDuration,
    formatEventPrice,
    formatTime
  } from "$lib/format";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const event = $derived(data.event);
  const nextOccurrence = $derived(
    event.occurrences.find((occurrence) => occurrence.status === "scheduled") ?? null
  );
  const duration = $derived(
    nextOccurrence === null ? null : formatDuration(nextOccurrence)
  );
</script>

<svelte:head>
  <title>{event.title} — Пермь.События</title>
  <meta name="description" content={event.lead} />
</svelte:head>

<main>
  <nav class="breadcrumb" aria-label="Хлебные крошки">
    <a href={resolve("/events")}>Афиша</a>
    <Icon name="chevron" size={13} />
    <a href="{resolve("/events")}?category={event.category.slug}">{event.category.name}</a>
    <Icon name="chevron" size={13} />
    <span aria-current="page">{event.title}</span>
  </nav>

  <section class="event-hero">
    <div class="event-intro">
      <p class="kicker">
        {event.category.name} · {event.ageRestriction}+
      </p>
      <h1>{event.title}</h1>
      <p class="lead">{event.lead}</p>

      <ul class="facts">
        {#if nextOccurrence !== null}
          <li>
            <Icon name="calendar" size={18} />
            {formatDayMonth(nextOccurrence.startsAt)}, {formatTime(nextOccurrence.startsAt)}
          </li>
        {/if}
        {#if event.venue !== null}
          <li>
            <Icon name="pin" size={18} />
            {event.venue.name} · {event.venue.address}
          </li>
        {/if}
        {#if duration !== null}
          <li>
            <Icon name="clock" size={18} />
            {duration}
          </li>
        {/if}
      </ul>

      {#if event.ticketUrl !== null}
        <a class="buy" href={event.ticketUrl} rel="external noopener">
          Купить билет · {formatEventPrice(event.price)}
          <Icon name="arrow" size={18} />
        </a>
      {:else if event.price.kind === "free"}
        <span class="buy static">Свободный вход</span>
      {:else}
        <span class="buy static">{formatEventPrice(event.price)}</span>
      {/if}
    </div>

    <div class="event-visual">
      <img src={event.image.url} alt={event.image.alt} />
      <span class="badge">{event.category.name}</span>
    </div>
  </section>

  <div class="event-content">
    <article class="article">
      <h2>О событии</h2>
      {#each event.description as paragraph, index (index)}
        <p>{paragraph}</p>
      {/each}
      {#if event.tags.length > 0}
        <ul class="tags">
          {#each event.tags as tag (tag)}
            <li>{tag}</li>
          {/each}
        </ul>
      {/if}
    </article>

    <aside class="schedule">
      <h2>Ближайшие сеансы</h2>
      {#if event.occurrences.length === 0}
        <p class="no-sessions">Новые даты появятся скоро.</p>
      {:else}
        <OccurrenceList occurrences={event.occurrences} />
      {/if}

      {#if event.venue !== null}
        <div class="venue">
          <p class="venue-label">Площадка</p>
          <p class="venue-name">{event.venue.name}</p>
          <p class="venue-address">{event.venue.address}</p>
        </div>
      {/if}

      {#if event.organizer !== null}
        <div class="venue">
          <p class="venue-label">Организатор</p>
          <p class="venue-name organizer">{event.organizer.name}</p>
          {#if event.organizer.website !== null}
            <a class="organizer-link" href={event.organizer.website} rel="external noopener">
              Сайт организатора
            </a>
          {/if}
        </div>
      {/if}
    </aside>
  </div>
</main>

<style>
  .breadcrumb {
    display: flex;
    align-items: center;
    gap: var(--space-s);
    min-height: 54px;
    padding: 0 var(--page-padding);
    border-bottom: 1px solid var(--border-subtle);
    color: var(--foreground-secondary);
    font-family: var(--font-caption);
    font-size: 11px;
  }

  .breadcrumb a:hover {
    color: var(--accent-primary);
  }

  .breadcrumb [aria-current] {
    color: var(--foreground-primary);
  }

  .event-hero {
    display: flex;
    gap: 48px;
    padding: 46px var(--page-padding);
  }

  .event-intro {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    max-width: 500px;
  }

  .kicker {
    margin: 0;
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 11px;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: clamp(38px, 4.4vw, 64px);
    font-weight: 500;
    letter-spacing: -0.015em;
    line-height: 1.02;
  }

  .lead {
    margin: 0;
    max-width: 460px;
    color: var(--foreground-secondary);
    font-size: 18px;
    line-height: 1.5;
  }

  .facts {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .facts li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
  }

  .facts :global(svg) {
    flex-shrink: 0;
    color: var(--accent-primary);
  }

  .buy {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    height: 50px;
    margin-top: 6px;
    padding: 0 22px;
    border-radius: var(--radius-sm);
    background: var(--accent-primary);
    color: #ffffff;
    font-size: 15px;
    font-weight: 600;
    transition: background 0.15s ease;
  }

  .buy:hover {
    background: var(--accent-deep);
  }

  .buy.static {
    background: var(--surface-secondary);
    color: var(--foreground-primary);
  }

  .event-visual {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .event-visual img {
    width: 100%;
    height: 408px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    background: var(--surface-secondary);
  }

  .badge {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 7px 9px;
    border-radius: var(--radius-sm);
    background: rgb(245 242 233 / 93%);
    font-family: var(--font-data);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .event-content {
    display: flex;
    gap: 56px;
    padding: 44px var(--page-padding) 56px;
    border-top: 1px solid var(--border-subtle);
  }

  .article {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 20px;
    min-width: 0;
  }

  .article h2 {
    margin: 0 0 12px;
    font-family: var(--font-heading);
    font-size: 34px;
    font-weight: 500;
  }

  .article p {
    margin: 0;
    max-width: 670px;
    color: var(--foreground-secondary);
    font-size: 17px;
    line-height: 1.58;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-s);
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }

  .tags li {
    padding: 8px 11px;
    border-radius: var(--radius-sm);
    background: var(--surface-secondary);
    font-family: var(--font-caption);
    font-size: 11px;
  }

  .schedule {
    display: flex;
    flex-direction: column;
    gap: 18px;
    width: 390px;
    flex-shrink: 0;
    padding-left: 32px;
    border-left: 1px solid var(--border-subtle);
  }

  .schedule h2 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 28px;
    font-weight: 500;
  }

  .no-sessions {
    margin: 0;
    color: var(--foreground-secondary);
    font-size: 14px;
  }

  .venue {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 18px;
  }

  .venue-label {
    margin: 0;
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .venue-name {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 500;
  }

  .venue-name.organizer {
    font-size: 18px;
  }

  .venue-address {
    margin: 0;
    color: var(--foreground-secondary);
    font-size: 13px;
  }

  .organizer-link {
    color: var(--accent-primary);
    font-size: 13px;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .event-hero {
      flex-direction: column;
      gap: var(--space-l);
      padding: 26px var(--page-padding);
    }

    .event-intro {
      max-width: none;
    }

    .event-visual img {
      height: 240px;
    }

    .event-content {
      flex-direction: column;
      gap: 32px;
      padding: 32px var(--page-padding) 48px;
    }

    .schedule {
      width: 100%;
      padding-left: 0;
      padding-top: 24px;
      border-top: 1px solid var(--border-subtle);
      border-left: 0;
    }
  }
</style>
