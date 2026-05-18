import almeida from '@/assets/reading-mode/bg-almeida.svg';
import belmonte from '@/assets/reading-mode/bg-belmonte.svg';
import castelomendo from '@/assets/reading-mode/bg-castelo-mendo.svg';
import castelonovo from '@/assets/reading-mode/bg-castelo-novo.svg';
import castelorod from '@/assets/reading-mode/bg-castelo-rodrigo.svg';
import idanha from '@/assets/reading-mode/bg-idanha.svg';
import linhares from '@/assets/reading-mode/bg-linhares.svg';
import marialva from '@/assets/reading-mode/bg-marialva.svg';
import monsanto from '@/assets/reading-mode/bg-monsanto.svg';
import piodao from '@/assets/reading-mode/bg-piodao.svg';
import sortelha from '@/assets/reading-mode/bg-sortelha.svg';
import trancoso from '@/assets/reading-mode/bg-trancoso.svg';

export const READING_BACKGROUNDS: Record<string, string> = {
  'idanha': idanha,
  'marialva': marialva,
  'piodao': piodao,
  'almeida': almeida,
  'trancoso': trancoso,
  'castelo-rod': castelorod,
  'belmonte': belmonte,
  'monsanto': monsanto,
  'sortelha': sortelha,
  'castelo-mendo': castelomendo,
  'castelo-novo': castelonovo,
  'linhares': linhares,
  'claro': marialva,
};

export interface ParticleColors {
  leaf: string;
  glow: string;
}

export const THEME_PARTICLE_COLORS: Record<string, ParticleColors> = {
  'idanha':        { leaf: '#4A90C7', glow: '#FFD166' },
  'marialva':      { leaf: '#6B8E7F', glow: '#F5E6C0' },
  'piodao':        { leaf: '#D4A556', glow: '#EDDAAE' },
  'almeida':       { leaf: '#7A5B9A', glow: '#F0B27A' },
  'trancoso':      { leaf: '#9B4DCA', glow: '#FFB627' },
  'castelo-rod':   { leaf: '#D19C45', glow: '#F5D789' },
  'belmonte':      { leaf: '#C98A82', glow: '#F4DFC5' },
  'monsanto':      { leaf: '#D66F93', glow: '#FFC9B5' },
  'sortelha':      { leaf: '#B5704A', glow: '#F0B860' },
  'castelo-mendo': { leaf: '#8BA18B', glow: '#E8DCC4' },
  'castelo-novo':  { leaf: '#BA8554', glow: '#F1E2BC' },
  'linhares':      { leaf: '#7C88B5', glow: '#E0DCEA' },
  'claro':         { leaf: '#6B8E7F', glow: '#F5E6C0' },
};

export function getReadingBackground(themeId: string): string {
  return READING_BACKGROUNDS[themeId] ?? marialva;
}

export function getParticleColors(themeId: string): ParticleColors {
  return THEME_PARTICLE_COLORS[themeId] ?? THEME_PARTICLE_COLORS['marialva'];
}
