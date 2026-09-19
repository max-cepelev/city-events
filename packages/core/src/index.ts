export interface City {
  readonly countryCode: string;
  readonly id: string;
  readonly isActive: boolean;
  readonly name: string;
  readonly region: string;
  readonly slug: string;
  readonly timezone: string;
}

export interface CityRepository {
  findActive(): Promise<readonly City[]>;
  findBySlug(slug: string): Promise<City | null>;
}

export interface Clock {
  now(): Date;
}
