export const GOALS = [
  { id: 'energy', label: 'Meer energie' },
  { id: 'sleep', label: 'Betere slaap' },
  { id: 'muscle', label: 'Spieropbouw' },
  { id: 'immune', label: 'Immuunsysteem' },
  { id: 'stress', label: 'Stressvermindering' },
]

export const FORMULAS = {
  energy: [
    { name: 'Vitamine B12', desc: 'Energiehuishouding en zenuwstelsel', dose: '1000mcg' },
    { name: 'Magnesium Malaat', desc: 'Spierfunctie en cellulaire energie', dose: '400mg' },
    { name: 'CoQ10', desc: 'Mitochondriale ondersteuning', dose: '100mg' },
  ],
  sleep: [
    { name: 'Melatonine', desc: 'Slaap-waakritme', dose: '0.5mg' },
    { name: 'Magnesium Glycinaat', desc: 'Ontspanning spieren en geest', dose: '300mg' },
    { name: 'Ashwagandha', desc: 'Vermindert avondstress', dose: '600mg' },
  ],
  muscle: [
    { name: 'Creatine Monohydraat', desc: 'Kracht en hersteltijd', dose: '5g' },
    { name: 'Vitamine D3 + K2', desc: 'Bot- en spierfunctie', dose: '5000IU / 100mcg' },
    { name: 'Zink', desc: 'Eiwitsynthese en herstel', dose: '15mg' },
  ],
  immune: [
    { name: 'Vitamine C', desc: 'Immuunondersteuning', dose: '1000mg' },
    { name: 'Zink Bisglycinaat', desc: 'Immuunreactie', dose: '15mg' },
    { name: 'Vitamine D3', desc: 'Immuun- en botfunctie', dose: '4000IU' },
  ],
  stress: [
    { name: 'Ashwagandha KSM-66', desc: 'Cortisolbalans', dose: '600mg' },
    { name: 'L-Theanine', desc: 'Kalme focus zonder sufheid', dose: '200mg' },
    { name: 'Rhodiola Rosea', desc: 'Mentale weerbaarheid', dose: '300mg' },
  ],
}

export const DEFAULT_USER = {
  email: 'gebruiker@youcaps.ai',
  name: 'Gebruiker',
}
