<script lang="ts">
  import { formatDayMonthShort, formatTime, formatWeekday } from "$lib/format";
  import type { Occurrence } from "$lib/types";

  interface Props {
    occurrences: readonly Occurrence[];
  }

  let { occurrences }: Props = $props();

  const STATUS_LABELS = {
    cancelled: "Отменён",
    postponed: "Перенесён"
  } as const;
</script>

<ul class="occurrences">
  {#each occurrences as occurrence (occurrence.id)}
    <li class="occurrence" class:inactive={occurrence.status !== "scheduled"}>
      <span class="session-date">
        <span class="day">{formatWeekday(occurrence.startsAt)}</span>
        <span class="date">{formatDayMonthShort(new Date(occurrence.startsAt))}</span>
      </span>
      {#if occurrence.status === "scheduled"}
        <span class="time">{formatTime(occurrence.startsAt)}</span>
      {:else}
        <span class="status" class:cancelled={occurrence.status === "cancelled"}>
          {STATUS_LABELS[occurrence.status]}
        </span>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .occurrences {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .occurrence {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 68px;
    padding: 0 14px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: rgb(255 255 255 / 33%);
  }

  .occurrence.inactive {
    opacity: 0.65;
  }

  .session-date {
    display: inline-flex;
    align-items: center;
    gap: 12px;
  }

  .day {
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 11px;
  }

  .date {
    font-size: 15px;
    font-weight: 600;
  }

  .time {
    font-family: var(--font-data);
    font-size: 13px;
  }

  .status {
    font-family: var(--font-caption);
    font-size: 12px;
    color: var(--foreground-secondary);
  }

  .status.cancelled {
    color: var(--accent-deep);
  }
</style>
