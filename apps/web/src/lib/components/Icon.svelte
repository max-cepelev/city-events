<script lang="ts" module>
  export type IconName =
    | "pin"
    | "search"
    | "arrow"
    | "check"
    | "chevron"
    | "menu"
    | "calendar"
    | "clock"
    | "plus"
    | "minus";

  const PATHS: Record<IconName, string> = {
    pin: "M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
    search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
    arrow: "M5 12h14m-6-6 6 6-6 6",
    check: "M4 12.5 9.5 18 20 6.5",
    chevron: "m9 6 6 6-6 6",
    menu: "M4 7h16M4 12h16M4 17h16",
    calendar:
      "M8 2v4m8-4v4M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm-2 5h18",
    clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-14v6l4 2",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14"
  };
</script>

<script lang="ts">
  interface Props {
    name: IconName;
    size?: number;
  }

  let { name, size = 16 }: Props = $props();
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  <path d={PATHS[name]} />
</svg>
