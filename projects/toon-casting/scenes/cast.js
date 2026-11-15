// "Y Si Te Tocara" — protagonist candidates (toon rig). The hero keeps face + hair tuft in every costume.
export const LEO  = { top: 'hoodie',  color: '#e8833a', legs: '#3d5a86', shoes: '#4a3226', hair: 'messy', hairColor: '#6a4128' };
export const TOMI = { top: 'shirt',   color: '#3f8fb0', legs: '#b8a074', shoes: '#4a3226', hair: 'side',  hairColor: '#2e2420', belt: '#5a3a24' };
export const NICO = { top: 'tshirt',  color: '#f2c21a', legs: '#3d5a86', shoes: '#c0392b', hair: 'messy', hairColor: '#3a2a20', hat: 'cap', hatColor: '#d64a33' };
export const ALMA = { top: 'sweater', color: '#4f9a5a', legs: '#3d4f6e', shoes: '#4a3226', hair: 'bun',   hairColor: '#4a2e1e' };
export const CANDIDATES = [['A · LEO', LEO], ['B · TOMI', TOMI], ['C · NICO', NICO], ['D · ALMA', ALMA]];
// Leo in costume (same face, same hair tuft)
export const LEO_GUARD   = { ...LEO, top: 'suit', color: '#24232b', color2: '#e8833a', legs: '#24232b', shoes: '#141418', face: 'sunglasses', earpiece: true };
export const LEO_SOLDIER = { ...LEO, top: 'uniform', color: '#7d7650', legs: '#6c6545', shoes: '#4a3226', belt: '#5a3a24', hat: 'bush', hatColor: '#7a7048', hatBand: '#4e4630' };
export const PRESIDENT   = { top: 'suit', color: '#2e3a5c', color2: '#2f5fa8', legs: '#2e3a5c', shoes: '#141418', hair: 'side', hairColor: '#cfcac0' };
