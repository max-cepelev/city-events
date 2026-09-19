<script lang="ts">
  import { resolve } from "$app/paths";

  import DateNavigator from "$lib/components/DateNavigator.svelte";
  import EventCard from "$lib/components/EventCard.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { formatDayMonth } from "$lib/format";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const todayLabel = formatDayMonth(new Date().toISOString()).toUpperCase();
</script>

<svelte:head>
  <title>Пермь.События — городская афиша</title>
  <meta
    name="description"
    content="Концерты, спектакли, выставки и городские события Перми — в одной афише. Выбирайте настроение, а мы покажем, куда идти."
  />
</svelte:head>

<main>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy">
      <p class="eyebrow">Афиша Перми · {todayLabel}</p>
      <h1 id="hero-title">Город, в котором всегда что-то происходит</h1>
      <p class="lead">
        Концерты, спектакли, выставки и городские события — в одной афише. Выбирайте
        настроение, а мы покажем, куда идти.
      </p>
      <div class="hero-actions">
        <a class="action-primary" href={resolve("/events")}>
          Смотреть афишу
          <Icon name="arrow" size={18} />
        </a>
        <a class="action-secondary" href="{resolve("/events")}?date=today">Что сегодня?</a>
      </div>
    </div>
    <div class="hero-visual">
      <img src="/images/seed/hero.jpg" alt="Камская набережная Перми в вечернем свете" />
      <p class="hero-badge">
        <Icon name="pin" size={16} />
        Пермь — Камская набережная
      </p>
    </div>
  </section>

  <DateNavigator />

  <section class="featured" aria-labelledby="featured-title">
    <div class="section-header">
      <div class="section-title-group">
        <p class="kicker">Редакционная подборка</p>
        <h2 id="featured-title">Главное в городе</h2>
      </div>
      <a class="view-all" href={resolve("/events")}>
        Вся афиша
        <Icon name="arrow" size={17} />
      </a>
    </div>
    <div class="cards">
      {#each data.featured as event (event.slug)}
        <EventCard {event} />
      {/each}
    </div>
  </section>
</main>

<style>
  .hero {
    display: flex;
    align-items: center;
    gap: 56px;
    padding: 56px var(--page-padding) 48px;
  }

  .hero-copy {
    display: flex;
    flex-direction: column;
    gap: 22px;
    max-width: 520px;
  }

  .eyebrow {
    margin: 0;
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: clamp(42px, 4.3vw, 62px);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.02;
  }

  .lead {
    margin: 0;
    max-width: 480px;
    color: var(--foreground-secondary);
    font-size: 18px;
    line-height: 1.5;
  }

  .hero-actions {
    display: flex;
    gap: 12px;
  }

  .action-primary,
  .action-secondary {
    display: inline-flex;
    align-items: center;
    height: 48px;
    border-radius: var(--radius-sm);
    font-size: 15px;
  }

  .action-primary {
    gap: 9px;
    padding: 0 20px;
    background: var(--accent-primary);
    color: #ffffff;
    font-weight: 600;
    transition: background 0.15s ease;
  }

  .action-primary:hover {
    background: var(--accent-deep);
  }

  .action-secondary {
    padding: 0 18px;
    border: 1px solid var(--foreground-primary);
    font-weight: 500;
  }

  .hero-visual {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .hero-visual img {
    width: 100%;
    height: 360px;
    border-radius: var(--radius-sm);
    object-fit: cover;
    background: var(--surface-secondary);
  }

  .hero-badge {
    position: absolute;
    bottom: 14px;
    left: 14px;
    display: inline-flex;
    align-items: center;
    gap: var(--space-s);
    margin: 0;
    padding: 10px 14px;
    border-radius: var(--radius-sm);
    background: rgb(245 242 233 / 93%);
    font-family: var(--font-caption);
    font-size: 12px;
  }

  .hero-badge :global(svg) {
    color: var(--accent-primary);
  }

  .featured {
    display: flex;
    flex-direction: column;
    gap: var(--space-l);
    padding: 42px var(--page-padding);
  }

  .section-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-m);
  }

  .section-title-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .kicker {
    margin: 0;
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 11px;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 38px;
    font-weight: 500;
  }

  .view-all {
    display: inline-flex;
    align-items: center;
    gap: var(--space-s);
    font-size: 14px;
    font-weight: 600;
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (max-width: 900px) {
    .hero {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-l);
      padding: 26px var(--page-padding) 16px;
    }

    .hero-copy {
      max-width: none;
    }

    .hero-visual img {
      height: 220px;
    }

    .cards {
      grid-template-columns: 1fr;
    }

    .featured {
      padding: 26px var(--page-padding);
    }
  }
</style>
