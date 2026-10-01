/** Tonos corporativos Bancolombia para avatares de perfil. */
export interface AvatarTone {
  background: string;
  color: string;
}

/**
 * Solo paleta de marca (primarios + secundarios de colors.scss).
 * No usar grises ni link-blue (#0099d8) en bolitas de perfil.
 */
const AVATAR_TONES: AvatarTone[] = [
  { background: '#fdda24', color: '#2c2a29' }, // amarillo macondo
  { background: '#9063cd', color: '#ffffff' }, // violeta orquídea
  { background: '#00c389', color: '#ffffff' }, // verde andino
  { background: '#ff7f41', color: '#ffffff' }, // naranja alba
  { background: '#f586cd', color: '#2c2a29' }, // rosa flamenco
  { background: '#59cbeb', color: '#2c2a29' }  // azul caribe
];

export function avatarToneForName(name: string): AvatarTone {
  const key = name.trim().toLowerCase();

  if (!key) {
    return AVATAR_TONES[0];
  }

  let hash = 0;

  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }

  return AVATAR_TONES[hash % AVATAR_TONES.length];
}
