<script lang="ts">
  import { LngLatBounds, type Map as MaplibreMap } from "maplibre-gl";
  import { MapLibre, Marker, Popup } from "svelte-maplibre-gl";
  import "maplibre-gl/dist/maplibre-gl.css";

  import { resolve } from "$app/paths";

  import type { MapVenueGroup } from "$lib/data";
  import { formatCardDate } from "$lib/format";

  import Icon from "./Icon.svelte";

  interface Props {
    groups: readonly MapVenueGroup[];
  }

  let { groups }: Props = $props();

  let map = $state<MaplibreMap>();
  let openVenueSlug = $state<string | null>(null);

  const openGroup = $derived(
    groups.find((group) => group.venue.slug === openVenueSlug) ?? null
  );

  // Камера охватывает все площадки с событиями; пересчитывается при смене фильтров.
  $effect(() => {
    if (map === undefined || groups.length === 0) {
      return;
    }
    const bounds = new LngLatBounds();
    for (const group of groups) {
      bounds.extend([group.venue.location.lon, group.venue.location.lat]);
    }
    map.fitBounds(bounds, { padding: 70, maxZoom: 14, duration: 0 });
  });
</script>

<div class="map">
  <MapLibre
    bind:map
    style="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
    center={{ lon: 56.2502, lat: 58.0105 }}
    zoom={12}
    maplibreLogo={false}
  >
    {#each groups as group (group.venue.slug)}
      <Marker
        lnglat={{ lon: group.venue.location.lon, lat: group.venue.location.lat }}
        onclick={() =>
          (openVenueSlug = openVenueSlug === group.venue.slug ? null : group.venue.slug)}
      >
        {#snippet content()}
          <button
            class="marker"
            class:multi={group.events.length > 1}
            type="button"
            aria-label="{group.venue.name}: {group.events.length} соб."
          >
            {#if group.events.length > 1}
              <span class="marker-count">{group.events.length}</span>
            {:else}
              <Icon name="pin" size={15} />
            {/if}
          </button>
        {/snippet}
      </Marker>
    {/each}

    {#if openGroup !== null}
      <Popup
        lnglat={{ lon: openGroup.venue.location.lon, lat: openGroup.venue.location.lat }}
        open
        onclose={() => (openVenueSlug = null)}
      >
        <div class="popup">
          <p class="popup-venue">{openGroup.venue.name}</p>
          <ul class="popup-events">
            {#each openGroup.events as event (event.slug)}
              <li>
                <a href={resolve("/events/[slug]", { slug: event.slug })}>
                  <span class="popup-date">{formatCardDate(event)}</span>
                  <span class="popup-title">{event.title}</span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </Popup>
    {/if}
  </MapLibre>
</div>

<style>
  .map {
    position: relative;
    overflow: hidden;
    height: min(62vh, 620px);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    background: var(--surface-secondary);
  }

  .marker {
    display: grid;
    min-width: 32px;
    height: 32px;
    padding: 0 4px;
    place-items: center;
    border: 2px solid #ffffff;
    border-radius: 50%;
    background: var(--accent-primary);
    color: #ffffff;
    box-shadow: 0 2px 8px rgb(45 41 38 / 35%);
    transition: transform 0.15s ease;
  }

  .marker:hover {
    transform: scale(1.12);
  }

  .marker-count {
    font-family: var(--font-data);
    font-size: 13px;
    font-weight: 500;
  }

  .popup {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 220px;
    max-width: 280px;
    padding: 4px 2px;
  }

  .popup-venue {
    margin: 0;
    font-family: var(--font-heading);
    font-size: 17px;
    font-weight: 600;
  }

  .popup-events {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .popup-events a {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .popup-date {
    color: var(--accent-primary);
    font-family: var(--font-data);
    font-size: 10px;
  }

  .popup-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.25;
  }

  .popup-events a:hover .popup-title {
    color: var(--accent-primary);
  }

  .map :global(.maplibregl-popup-content) {
    border-radius: var(--radius-sm);
    background: var(--surface-primary);
    color: var(--foreground-primary);
    font-family: var(--font-body);
    box-shadow: 0 6px 24px rgb(45 41 38 / 22%);
  }

  .map :global(.maplibregl-popup-tip) {
    border-top-color: var(--surface-primary);
  }

  .map :global(.maplibregl-popup-close-button) {
    padding: 2px 8px;
    color: var(--foreground-secondary);
    font-size: 16px;
  }
</style>
