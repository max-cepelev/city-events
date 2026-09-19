<script lang="ts">
  import { resolve } from "$app/paths";

  interface Props {
    title?: string;
    note?: string;
  }

  let {
    title = "Ничего не найдено",
    note = "Попробуйте изменить дату, категорию или поисковый запрос."
  }: Props = $props();
</script>

<div class="empty" role="status">
  <h2>{title}</h2>
  <p>{note}</p>
  <a href={resolve("/events")}>Показать всю афишу</a>
</div>

<style>
  .empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 56px 0;
  }

  h2 {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 30px;
    font-weight: 500;
  }

  p {
    margin: 0;
    color: var(--foreground-secondary);
    font-size: 15px;
  }

  a {
    margin-top: 6px;
    color: var(--accent-primary);
    font-weight: 600;
  }
</style>
