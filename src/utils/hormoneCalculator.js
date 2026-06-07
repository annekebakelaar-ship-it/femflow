// Hormone level simulation using Gaussian distribution
const HORMONES = {
  estrogen: {
    peak: 12,
    peakValue: 75,
    width: 8,
  },
  progesterone: {
    peak: 21,
    peakValue: 80,
    width: 6,
  },
  fsh: {
    peak: 12,
    peakValue: 70,
    width: 2,
  },
  lh: {
    peak: 13,
    peakValue: 90,
    width: 1,
  },
}

// Gaussian distribution function
function gaussianCurve(day, peak, peakValue, width) {
  return peakValue * Math.exp(-Math.pow(day - peak, 2) / (2 * width * width))
}

export function getHormoneLevel(day, hormoneType) {
  const hormone = HORMONES[hormoneType]
  if (!hormone) return 0
  return Math.round(gaussianCurve(day, hormone.peak, hormone.peakValue, hormone.width))
}

export function getHormoneData(cycleLength = 28) {
  const data = []
  for (let day = 1; day <= cycleLength; day++) {
    data.push({
      day,
      estrogen: getHormoneLevel(day, 'estrogen'),
      progesterone: getHormoneLevel(day, 'progesterone'),
      fsh: getHormoneLevel(day, 'fsh'),
      lh: getHormoneLevel(day, 'lh'),
    })
  }
  return data
}

export function getHormoneDescription(day, cycleLength = 28) {
  if (day < 5) return 'Estrogeen laag, progesterone laag'
  if (day < 11) return 'Estrogeen stijgt'
  if (day < 16) return 'Estrogeen piekt, LH surge'
  return 'Progesterone stijgt'
}
