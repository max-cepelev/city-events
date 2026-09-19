<script lang="ts">
  import EmptyState from "$lib/components/EmptyState.svelte";
  import EventCard from "$lib/components/EventCard.svelte";
  import FilterPanel from "$lib/components/FilterPanel.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import Pagination from "$lib/components/Pagination.svelte";
  import { formatMonthYear, pluralizeEvents } from "$lib/format";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const monthYearLabel = $derived(formatMonthYear(new Date()).toUpperCase());

  const activeQuery = $derived(
    Object.fromEntries(
      Object.entries({
        category: data.filter.category,
        date: data.filter.date,
        price: data.filter.price,
        q: data.filter.q
      }).filter(([, value]) => value !== "")
    )
  );
</script>

<svelte:head>
  <title>Афиша событий — Пермь.События</title>
  <meta
    name="description"
    content="Все события Перми в одной афише: концерты, спектакли, выставки, экскурсии. Фильтры по дате, категории и цене."
  />
</svelte:head>

<main>
  <section class="catalog-intro" aria-labelledby="catalog-title">
    <p class="kicker">Пермь · {monthYearLabel}</p>
    <div class="title-row">
      <h1 id="catalog-title">Афиша событий</h1>
      <span class="count">
        {data.result.totalItems} {pluralizeEvents(data.result.totalItems)}
      </span>
    </div>
    <form class="search" method="GET" action="/events" role="search">
      {#if data.filter.category !== ""}
        <input type="hidden" name="category" value={data.filter.category} />
      {/if}
      {#if data.filter.date !== ""}
        <input type="hidden" name="date" value={data.filter.date} />
      {/if}
      {#if data.filter.price !== ""}
        <input type="hidden" name="price" value={data.filter.price} />
      {/if}
      <Icon name="search" size={18} />
      <input
        type="search"
        name="q"
        value={data.filter.q}
        placeholder="Найти концерт, выставку, спектакль или место"
        aria-label="Поиск по афише"
      />
    </form>
  </section>

  <div class="catalog-body">
    <FilterPanel categories={data.categories} current={data.filter} />

    <section class="results" aria-labelledby="results-title">
      <div class="sort-row">
        <h2 id="results-title">Ближайшие события</h2>
      </div>

      {#if data.result.items.length === 0}
        <EmptyState />
      {:else}
        <div class="grid">
          {#each data.result.items as event (event.slug)}
            <EventCard {event} />
          {/each}
        </div>
        <Pagination
          page={data.result.page}
          totalPages={data.result.totalPages}
          query={activeQuery}
        />
      {/if}
    </section>
  </div>
</main>

<style>
  .catalog-intro {
    display: flex;
    flex-direction: column;
    gap: 18px;
    padding: 42px var(--page-padding) 28px;
  }

  .kicker {
    margin: 0;
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .title-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-m);
  }

  h1 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: clamp(36px, 3.6vw, 52px);
    font-weight: 500;
    letter-spacing: -0.01em;
  }

  .count {
    color: var(--foreground-secondary);
    font-family: var(--font-data);
    font-size: 12px;
    white-space: nowrap;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 10px;
    height: 46px;
    padding: 0 14px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: rgb(255 255 255 / 53%);
    color: var(--foreground-secondary);
  }

  .search input {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--foreground-primary);
    font-size: 15px;
    outline: none;
  }

  .search input::placeholder {
    color: var(--foreground-secondary);
  }

  .search:focus-within {
    border-color: var(--accent-primary);
  }

  .catalog-body {
    display: flex;
    gap: 32px;
    padding: 24px var(--page-padding) 48px;
  }

  .results {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 26px;
    min-width: 0;
  }

  .sort-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  h2 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 26px;
    font-weight: 500;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 28px 18px;
  }

  @media (max-width: 1100px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 900px) {
    .catalog-body {
      flex-direction: column;
    }
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
