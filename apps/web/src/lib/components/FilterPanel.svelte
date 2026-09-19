<script lang="ts">
  import { resolve } from "$app/paths";

  import type { Category } from "$lib/types";

  import Icon from "./Icon.svelte";

  interface Props {
    categories: readonly Category[];
    current: {
      readonly category: string;
      readonly date: string;
      readonly price: string;
      readonly q: string;
    };
  }

  let { categories, current }: Props = $props();

  const DATE_OPTIONS = [
    { value: "", label: "Все даты" },
    { value: "today", label: "Сегодня" },
    { value: "tomorrow", label: "Завтра" },
    { value: "weekend", label: "Выходные" },
    { value: "week", label: "На неделе" }
  ];

  const PRICE_OPTIONS = [
    { value: "", label: "Любая" },
    { value: "free", label: "Бесплатно" },
    { value: "500", label: "До 500 ₽" },
    { value: "1000", label: "До 1 000 ₽" }
  ];
</script>

<form class="filters" method="GET" action="/events">
  <div class="filters-heading">
    <h2>Фильтры</h2>
    <a class="reset" href={resolve("/events")}>Сбросить</a>
  </div>

  {#if current.q !== ""}
    <input type="hidden" name="q" value={current.q} />
  {/if}

  <fieldset class="group">
    <legend>Дата</legend>
    {#each DATE_OPTIONS as option (option.value)}
      <label class="option">
        <input
          type="radio"
          name="date"
          value={option.value}
          checked={current.date === option.value}
          onchange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        <span class="box" aria-hidden="true"><Icon name="check" size={12} /></span>
        <span>{option.label}</span>
      </label>
    {/each}
  </fieldset>

  <fieldset class="group">
    <legend>Категория</legend>
    <label class="option">
      <input
        type="radio"
        name="category"
        value=""
        checked={current.category === ""}
        onchange={(event) => event.currentTarget.form?.requestSubmit()}
      />
      <span class="box" aria-hidden="true"><Icon name="check" size={12} /></span>
      <span>Все категории</span>
    </label>
    {#each categories as category (category.slug)}
      <label class="option">
        <input
          type="radio"
          name="category"
          value={category.slug}
          checked={current.category === category.slug}
          onchange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        <span class="box" aria-hidden="true"><Icon name="check" size={12} /></span>
        <span>{category.name}</span>
      </label>
    {/each}
  </fieldset>

  <fieldset class="group">
    <legend>Цена</legend>
    {#each PRICE_OPTIONS as option (option.value)}
      <label class="option">
        <input
          type="radio"
          name="price"
          value={option.value}
          checked={current.price === option.value}
          onchange={(event) => event.currentTarget.form?.requestSubmit()}
        />
        <span class="box" aria-hidden="true"><Icon name="check" size={12} /></span>
        <span>{option.label}</span>
      </label>
    {/each}
  </fieldset>

  <noscript>
    <button class="apply" type="submit">Показать</button>
  </noscript>
</form>

<style>
  .filters {
    display: flex;
    flex-direction: column;
    gap: 28px;
    width: 248px;
    flex-shrink: 0;
    padding-right: var(--space-l);
    border-right: 1px solid var(--border-subtle);
  }

  .filters-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .filters-heading h2 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 24px;
    font-weight: 500;
  }

  .reset {
    color: var(--accent-primary);
    font-family: var(--font-caption);
    font-size: 11px;
  }

  .group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .group legend {
    margin-bottom: 12px;
    padding: 0;
    font-family: var(--font-caption);
    font-size: 12px;
    font-weight: 600;
  }

  .option {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 14px;
    cursor: pointer;
  }

  .option input {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }

  .box {
    display: grid;
    width: 17px;
    height: 17px;
    flex-shrink: 0;
    place-items: center;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--surface-primary);
    color: transparent;
  }

  .option input:checked + .box {
    border-color: var(--accent-primary);
    background: var(--accent-primary);
    color: #ffffff;
  }

  .option input:focus-visible + .box {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
  }

  .apply {
    height: 42px;
    border-radius: var(--radius-sm);
    background: var(--accent-primary);
    color: #ffffff;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .filters {
      width: 100%;
      padding-right: 0;
      padding-bottom: var(--space-l);
      border-right: 0;
      border-bottom: 1px solid var(--border-subtle);
    }
  }
</style>
