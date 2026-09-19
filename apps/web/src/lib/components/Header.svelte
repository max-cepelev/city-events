<script lang="ts">
  import { resolve } from "$app/paths";
  import { page } from "$app/state";

  import Icon from "./Icon.svelte";

  let menuOpen = $state(false);

  const isEvents = $derived(page.url.pathname.startsWith("/events"));
  const dateParam = $derived(page.url.searchParams.get("date"));

  const navItems = $derived([
    {
      route: "/events" as const,
      query: "",
      label: "Афиша",
      active: isEvents && dateParam === null
    },
    {
      route: "/events" as const,
      query: "?date=today",
      label: "Сегодня",
      active: dateParam === "today"
    },
    {
      route: "/events" as const,
      query: "?date=weekend",
      label: "Выходные",
      active: dateParam === "weekend"
    }
  ]);
</script>

<header class="site-header">
  <a class="brand" href={resolve("/")} aria-label="Пермь.События — на главную">
    <span class="brand-mark" aria-hidden="true">П</span>
    <span class="brand-name">Пермь.События</span>
  </a>

  <nav class="main-nav" aria-label="Основная навигация">
    {#each navItems as item (item.label)}
      <a
        href="{resolve(item.route)}{item.query}"
        class:active={item.active}
        aria-current={item.active ? "page" : undefined}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <div class="tools">
    <span class="city">
      <Icon name="pin" size={16} />
      Пермь
    </span>
    <a class="tool-link" href={resolve("/events")} aria-label="Поиск по афише">
      <Icon name="search" size={21} />
    </a>
    <button
      class="tool-link menu-toggle"
      type="button"
      aria-expanded={menuOpen}
      aria-controls="mobile-nav"
      aria-label="Меню"
      onclick={() => (menuOpen = !menuOpen)}
    >
      <Icon name="menu" size={20} />
    </button>
  </div>
</header>

{#if menuOpen}
  <nav id="mobile-nav" class="mobile-nav" aria-label="Мобильная навигация">
    {#each navItems as item (item.label)}
      <a
        href="{resolve(item.route)}{item.query}"
        class:active={item.active}
        aria-current={item.active ? "page" : undefined}
        onclick={() => (menuOpen = false)}
      >
        {item.label}
      </a>
    {/each}
  </nav>
{/if}

<style>
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 76px;
    padding: 0 var(--header-padding, 64px);
    border-bottom: 1px solid var(--border-subtle);
    background: var(--surface-primary);
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .brand-mark {
    display: grid;
    width: 36px;
    height: 36px;
    place-items: center;
    border-radius: 18px;
    background: var(--accent-primary);
    color: #ffffff;
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 700;
  }

  .brand-name {
    font-family: var(--font-heading);
    font-size: 22px;
    font-weight: 600;
  }

  .main-nav {
    display: flex;
    align-items: center;
    gap: 30px;
  }

  .main-nav a {
    font-size: 15px;
  }

  .main-nav a.active {
    color: var(--accent-primary);
    font-weight: 600;
  }

  .tools {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .city {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-sm);
    font-size: 14px;
  }

  .tool-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--foreground-primary);
  }

  .menu-toggle {
    display: none;
  }

  .mobile-nav {
    display: none;
  }

  @media (max-width: 768px) {
    .site-header {
      height: 64px;
      padding: 0 var(--page-padding);
    }

    .brand-mark {
      width: 30px;
      height: 30px;
      border-radius: 15px;
      font-size: 18px;
    }

    .brand-name {
      font-size: 18px;
    }

    .main-nav {
      display: none;
    }

    .city {
      display: none;
    }

    .menu-toggle {
      display: inline-flex;
    }

    .mobile-nav {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px var(--page-padding) 16px;
      border-bottom: 1px solid var(--border-subtle);
      background: var(--surface-primary);
    }

    .mobile-nav a {
      padding: 10px 0;
      font-size: 17px;
    }

    .mobile-nav a.active {
      color: var(--accent-primary);
      font-weight: 600;
    }
  }
</style>
