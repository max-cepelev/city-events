<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";
</script>

<svelte:head>
  <title>{page.status} — Пермь.События</title>
</svelte:head>

<main class="error-page">
  <p class="code">{page.status}</p>
  <h1>{page.status === 404 ? "Страница не найдена" : "Что-то пошло не так"}</h1>
  <p class="note">{page.error?.message ?? "Попробуйте обновить страницу чуть позже."}</p>
  <a class="home-link" href={resolve("/")}>На главную</a>
</main>

<style>
  .error-page {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-height: 50vh;
    padding: 80px var(--page-padding);
  }

  .code {
    margin: 0;
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 12px;
    letter-spacing: 0.1em;
  }

  h1 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 44px;
    font-weight: 500;
  }

  .note {
    margin: 0;
    color: var(--foreground-secondary);
    font-size: 16px;
  }

  .home-link {
    display: inline-flex;
    align-items: center;
    height: 46px;
    margin-top: 10px;
    padding: 0 20px;
    border-radius: var(--radius-sm);
    background: var(--accent-primary);
    color: #ffffff;
    font-weight: 600;
  }
</style>
