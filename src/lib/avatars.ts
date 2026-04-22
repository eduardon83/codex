import loboSvg from '@/assets/avatars/avatar-lobo-iberico.svg';
import linceSvg from '@/assets/avatars/avatar-lince-iberico.svg';
import aguiaSvg from '@/assets/avatars/avatar-aguia-imperial.svg';
import burroSvg from '@/assets/avatars/avatar-burro-portugues.svg';
import lobomSvg from '@/assets/avatars/avatar-lobo-marinho.svg';
import abutreSvg from '@/assets/avatars/avatar-abutre-negro.svg';
import foliumIcon from '@/assets/folium-icon.svg';

export const AVATARS = [
  { id: 'lobo-iberico', name: 'Lobo Ibérico', nameEn: 'Iberian Wolf', description: 'O lobo ibérico é um dos maiores predadores selvagens da Península Ibérica. Em Portugal existe sobretudo a norte do rio Douro. É um animal social que vive em alcateias e comunica através de uivos.', file: loboSvg },
  { id: 'lince-iberico', name: 'Lince Ibérico', nameEn: 'Iberian Lynx', description: 'O lince ibérico foi o felino mais ameaçado do mundo. Reconhece-se pelas costeletas brancas e pelos pincéis negros nas orelhas. Recuperou graças a programas de conservação em Portugal e Espanha.', file: linceSvg },
  { id: 'aguia-imperial', name: 'Águia Imperial Ibérica', nameEn: 'Iberian Imperial Eagle', description: 'Uma das aves de rapina mais raras do mundo. Nidifica no sul de Portugal e distingue-se pelas manchas brancas nos ombros. É símbolo de conservação da natureza ibérica.', file: aguiaSvg },
  { id: 'burro-portugues', name: 'Burro de Miranda', nameEn: 'Miranda Donkey', description: 'O burro de Miranda é uma raça autóctone portuguesa em risco de extinção. Originário de Trás-os-Montes, é robusto e resistente. A cruz escura no dorso é uma das suas marcas características.', file: burroSvg },
  { id: 'lobo-marinho', name: 'Lobo-marinho', nameEn: 'Mediterranean Monk Seal', description: 'O lobo-marinho ou foca-monge é o mamífero marinho mais ameaçado da Europa. Em Portugal ainda existe uma pequena população nos recifes da Costa Vicentina e nas ilhas Desertas.', file: lobomSvg },
  { id: 'abutre-negro', name: 'Abutre Negro', nameEn: 'Cinereous Vulture', description: 'O maior voador da Europa com até 3 metros de envergadura. Encontra-se no Alentejo e no Douro Internacional. É um limpador da natureza fundamental para o ecossistema.', file: abutreSvg },
] as const;

export type AvatarId = typeof AVATARS[number]['id'];

export function getAvatarById(id?: string | null) {
  return AVATARS.find((avatar) => avatar.id === id) ?? null;
}

export function resolveAvatarSrc(id?: string | null) {
  return getAvatarById(id)?.file ?? foliumIcon;
}