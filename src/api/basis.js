// Het adres van de backend, op één plek.
//
// WAAROM DIT BESTAAT: de terugval op de productie-API stond op twee plekken.
// Werd `VITE_API_URL` bij een build vergeten, dan praatte die bouw stilletjes
// tegen productie. Voor een testomgeving is dat precies het ongeluk dat je
// niet wilt: je denkt met testgegevens te werken en raakt echte gebruikers.
//
// De terugval blijft bestaan voor de productiebouw, die hem al jaren gebruikt.
// Wat erbij komt is een harde eis voor testbouwen: zet `VITE_OMGEVING=test`,
// en dan MOET `VITE_API_URL` gezet zijn en mag hij niet naar productie wijzen.
// Die eis wordt ook in vite.config.js tijdens het bouwen afgedwongen, zodat
// een verkeerde testbouw niet eens afgemaakt wordt.

export const PRODUCTIE_API = 'https://femflow-api.onrender.com'

const opgegeven = import.meta.env.VITE_API_URL
const omgeving = import.meta.env.VITE_OMGEVING || 'productie'

if (omgeving === 'test') {
  if (!opgegeven) {
    throw new Error('VITE_OMGEVING=test maar VITE_API_URL ontbreekt: deze bouw zou tegen productie praten')
  }
  if (opgegeven.replace(/\/$/, '') === PRODUCTIE_API) {
    throw new Error('VITE_OMGEVING=test wijst naar de productie-API')
  }
}

export const API_BASIS = (opgegeven || PRODUCTIE_API).replace(/\/$/, '')
export const IS_TESTOMGEVING = omgeving === 'test'
