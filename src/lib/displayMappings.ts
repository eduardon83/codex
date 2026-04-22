import type { TFunction } from 'i18next';

export function tGenre(key: string, t: TFunction): string {
  return t(`genres.${key}`, { defaultValue: key });
}

export function tFormat(key: string, t: TFunction): string {
  return t(`formats.${key}`, { defaultValue: key });
}

export function tStatus(key: string, t: TFunction): string {
  return t(`reading_status.${key}`, { defaultValue: key });
}