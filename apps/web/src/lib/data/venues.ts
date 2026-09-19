import type { VenueSummary } from "$lib/types";

/**
 * Реальные площадки Перми; адреса — best-effort для мок-данных,
 * при подключении импорта уточняются источниками.
 */
export const VENUES: Readonly<Record<string, VenueSummary>> = {
  "teatr-teatr": { name: "Театр-Театр", address: "бул. Гагарина, 27А" },
  opera: {
    name: "Пермский театр оперы и балета",
    address: "ул. Петропавловская, 25"
  },
  philharmonic: { name: "Пермская филармония", address: "ул. Сибирская, 18" },
  permm: {
    name: "Музей современного искусства PERMM",
    address: "ул. Монастырская, 2"
  },
  gallery: {
    name: "Пермская художественная галерея",
    address: "Комсомольский пр., 4"
  },
  museum: {
    name: "Пермский краеведческий музей",
    address: "ул. Монастырская, 11"
  },
  zoo: { name: "Пермский зоопарк", address: "ул. Монастырская, 10" },
  esplanade: { name: "Эспланада", address: "бул. Гагарина" },
  puppet: { name: "Пермский театр кукол", address: "ул. Сибирская, 31" }
};
