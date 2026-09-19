<script lang="ts">
  import { MapLibre, Marker } from "svelte-maplibre-gl";
  // Явно задаёт URL воркера через Vite-пайплайн (SSR-safe: внутри guard по window).
  import "svelte-maplibre-gl/vite";
  import "maplibre-gl/dist/maplibre-gl.css";

  import type { VenueSummary } from "$lib/types";

  import Icon from "./Icon.svelte";

  interface Props {
    venue: VenueSummary;
  }

  let { venue }: Props = $props();

  let zoom = $state(15);

  const MIN_ZOOM = 9;
  const MAX_ZOOM = 18;
</script>

<div class="map">
  <MapLibre
    style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
    center={venue.location}
    bind:zoom
    scrollZoom={false}
    maplibreLogo={false}
  >
    <Marker lnglat={venue.location}>
      {#snippet content()}
        <span class="marker" aria-hidden="true">
          <Icon name="pin" size={16} />
        </span>
      {/snippet}
    </Marker>
  </MapLibre>

  <div class="zoom-controls">
    <button
      type="button"
      aria-label="Приблизить"
      disabled={zoom >= MAX_ZOOM}
      onclick={() => (zoom = Math.min(MAX_ZOOM, zoom + 1))}
    >
      <Icon name="plus" size={15} />
    </button>
    <button
      type="button"
      aria-label="Отдалить"
      disabled={zoom <= MIN_ZOOM}
      onclick={() => (zoom = Math.max(MIN_ZOOM, zoom - 1))}
    >
      <Icon name="minus" size={15} />
    </button>
  </div>
</div>

<style>
  .map {
    position: relative;
    overflow: hidden;
    height: 240px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--surface-secondary);
  }

  .map :global(.maplibregl-canvas) {
    outline: none;
  }

  .marker {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: var(--accent-primary);
    color: #ffffff;
    box-shadow: 0 2px 8px rgb(45 41 38 / 35%);
  }

  .zoom-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
  }

  .zoom-controls button {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    border: 1px solid var(--border-subtle);
    background: var(--surface-primary);
    color: var(--foreground-primary);
  }

  .zoom-controls button:first-child {
    border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  }

  .zoom-controls button:last-child {
    border-top: 0;
    border-radius: 0 0 var(--radius-sm) var(--radius-sm);
  }

  .zoom-controls button:disabled {
    color: var(--border-subtle);
    cursor: default;
  }
</style>
