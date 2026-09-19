import type { VenueSummary } from "$lib/types";

/**
 * Реальные площадки Перми; адреса и координаты — best-effort для мок-данных,
 * при подключении импорта уточняются источниками.
 */
export const VENUES: Readonly<Record<string, VenueSummary>> = {
  "teatr-teatr": {
    name: "Театр-Театр",
    address: "бул. Гагарина, 27А",
    location: { lon: 56.2433, lat: 58.0147 }
  },
  opera: {
    name: "Пермский театр оперы и балета",
    address: "ул. Петропавловская, 25",
    location: { lon: 56.2447, lat: 58.0196 }
  },
  philharmonic: {
    name: "Пермская филармония",
    address: "ул. Сибирская, 18",
    location: { lon: 56.2398, lat: 58.0097 }
  },
  permm: {
    name: "Музей современного искусства PERMM",
    address: "ул. Монастырская, 2",
    location: { lon: 56.2515, lat: 58.0185 }
  },
  gallery: {
    name: "Пермская художественная галерея",
    address: "Комсомольский пр., 4",
    location: { lon: 56.2375, lat: 58.017 }
  },
  museum: {
    name: "Пермский краеведческий музей",
    address: "ул. Монастырская, 11",
    location: { lon: 56.2445, lat: 58.0169 }
  },
  zoo: {
    name: "Пермский зоопарк",
    address: "ул. Монастырская, 10",
    location: { lon: 56.2435, lat: 58.0175 }
  },
  esplanade: {
    name: "Эспланада",
    address: "бул. Гагарина",
    location: { lon: 56.243, lat: 58.0142 }
  },
  puppet: {
    name: "Пермский театр кукол",
    address: "ул. Сибирская, 31",
    location: { lon: 56.236, lat: 58.0085 }
  }
};
