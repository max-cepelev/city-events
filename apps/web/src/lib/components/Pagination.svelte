<script lang="ts">
  import { resolve } from "$app/paths";

  import Icon from "./Icon.svelte";

  interface Props {
    page: number;
    totalPages: number;
    /** Активные фильтры каталога, сохраняемые в ссылках страниц. */
    query: Record<string, string>;
  }

  let { page, totalPages, query }: Props = $props();

  const pages = $derived(Array.from({ length: totalPages }, (_, index) => index + 1));

  /** Query-строка страницы («?category=…&page=2») или пустая строка. */
  function queryString(pageNumber: number): string {
    const params = new URLSearchParams(query);
    if (pageNumber > 1) {
      params.set("page", String(pageNumber));
    } else {
      params.delete("page");
    }
    const value = params.toString();
    return value === "" ? "" : `?${value}`;
  }
</script>

{#if totalPages > 1}
  <nav class="pagination" aria-label="Страницы каталога">
    {#if page > 1}
      <a
        class="step"
        href="{resolve("/events")}{queryString(page - 1)}"
        aria-label="Предыдущая страница"
      >
        <span class="flip"><Icon name="arrow" size={15} /></span>
        Назад
      </a>
    {/if}
    {#each pages as pageNumber (pageNumber)}
      <a
        class="page-link"
        class:current={pageNumber === page}
        href="{resolve("/events")}{queryString(pageNumber)}"
        aria-current={pageNumber === page ? "page" : undefined}
      >
        {pageNumber}
      </a>
    {/each}
    {#if page < totalPages}
      <a
        class="step"
        href="{resolve("/events")}{queryString(page + 1)}"
        aria-label="Следующая страница"
      >
        Вперёд
        <Icon name="arrow" size={15} />
      </a>
    {/if}
  </nav>
{/if}

<style>
  .pagination {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .page-link,
  .step {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-width: 38px;
    height: 38px;
    padding: 0 10px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    font-family: var(--font-data);
    font-size: 12px;
  }

  .page-link.current {
    border-color: var(--foreground-primary);
    background: var(--foreground-primary);
    color: #ffffff;
  }

  .step {
    font-family: var(--font-body);
    font-size: 13px;
    font-weight: 600;
  }

  .flip {
    display: inline-flex;
    transform: rotate(180deg);
  }
</style>
