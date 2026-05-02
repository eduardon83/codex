export const DARK_THEME_IDS = [
  'idanha',
  'marialva',
  'piodao',
  'almeida',
  'trancoso',
  'castelo-rod',
  'castelo_rodrigo',
  'belmonte',
  'monsanto',
  'sortelha',
  'castelo-mendo',
  'castelo_mendo',
  'castelo-novo',
  'castelo_novo',
  'linhares',
];

export function isCodexDarkTheme(themeId: string) {
  return DARK_THEME_IDS.includes(themeId);
}