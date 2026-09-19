<script lang="ts">
  import { resolve } from "$app/paths";

  import { resolveDatePreset, zonedDateParts } from "$lib/dates";
  import { formatDayMonthShort } from "$lib/format";
  import type { DatePreset } from "$lib/types";

  import Icon from "./Icon.svelte";

  interface Props {
    active?: DatePreset | null;
  }

  let { active = null }: Props = $props();

  const PRESETS: readonly { id: DatePreset; label: string }[] = [
    { id: "today", label: "Сегодня" },
    { id: "tomorrow", label: "Завтра" },
    { id: "weekend", label: "Выходные" },
    { id: "week", label: "На неделе" }
  ];

  /** «19 сен», «19–20 сен», «30 сен–2 окт» — подпись диапазона пресета. */
  function rangeLabel(preset: DatePreset): string {
    const range = resolveDatePreset(preset);
    const last = new Date(range.to.getTime() - 1);
    const fromParts = zonedDateParts(range.from);
    const lastParts = zonedDateParts(last);
    if (fromParts.day === lastParts.day && fromParts.month === lastParts.month) {
      return formatDayMonthShort(range.from);
    }
    if (fromParts.month === lastParts.month) {
      return `${fromParts.day}–${formatDayMonthShort(last)}`;
    }
    return `${formatDayMonthShort(range.from)}–${formatDayMonthShort(last)}`;
  }
</script>

<nav class="date-nav" aria-label="Быстрый выбор даты">
  {#each PRESETS as preset (preset.id)}
    <a
      class="preset"
      class:active={active === preset.id}
      href="{resolve("/events")}?date={preset.id}"
      aria-current={active === preset.id ? "true" : undefined}
    >
      <span class="preset-label">{preset.label}</span>
      <span class="preset-date">{rangeLabel(preset.id)}</span>
    </a>
  {/each}
  <a class="all-link" href={resolve("/events")}>
    Все категории
    <Icon name="arrow" size={16} />
  </a>
</nav>

<style>
  .date-nav {
    display: flex;
    align-items: center;
    gap: var(--space-s);
    min-height: 76px;
    padding: 12px var(--page-padding);
    border-top: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
    overflow-x: auto;
  }

  .preset {
    display: inline-flex;
    align-items: center;
    gap: var(--space-s);
    height: 42px;
    padding: 0 var(--space-m);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--surface-primary);
    white-space: nowrap;
  }

  .preset-label {
    font-size: 14px;
    font-weight: 600;
  }

  .preset-date {
    color: var(--foreground-secondary);
    font-family: var(--font-data);
    font-size: 11px;
  }

  .preset.active {
    border-color: var(--foreground-primary);
    background: var(--foreground-primary);
    color: #ffffff;
  }

  .preset.active .preset-date {
    color: rgb(255 255 255 / 67%);
  }

  .all-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-s);
    height: 42px;
    padding: 0 var(--space-m);
    color: var(--accent-primary);
    font-size: 14px;
    white-space: nowrap;
  }
</style>
