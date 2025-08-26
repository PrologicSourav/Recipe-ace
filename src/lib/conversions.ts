
type UnitType = 'weight' | 'volume' | 'count';
interface Conversion {
  base: string;
  factor: number;
  type: UnitType;
}

const CONVERSIONS: Record<string, Conversion> = {
  // Weight
  g: { base: 'g', factor: 1, type: 'weight' },
  gram: { base: 'g', factor: 1, type: 'weight' },
  grams: { base: 'g', factor: 1, type: 'weight' },
  kg: { base: 'g', factor: 1000, type: 'weight' },
  kilogram: { base: 'g', factor: 1000, type: 'weight' },
  kilograms: { base: 'g', factor: 1000, type: 'weight' },
  oz: { base: 'g', factor: 28.35, type: 'weight' },
  ounce: { base: 'g', factor: 28.35, type: 'weight' },
  ounces: { base: 'g', factor: 28.35, type: 'weight' },
  lb: { base: 'g', factor: 453.592, type: 'weight' },
  lbs: { base: 'g', factor: 453.592, type: 'weight' },
  pound: { base: 'g', factor: 453.592, type: 'weight' },
  pounds: { base: 'g', factor: 453.592, type: 'weight' },

  // Volume
  ml: { base: 'ml', factor: 1, type: 'volume' },
  milliliter: { base: 'ml', factor: 1, type: 'volume' },
  milliliters: { base: 'ml', factor: 1, type: 'volume' },
  l: { base: 'ml', factor: 1000, type: 'volume' },
  liter: { base: 'ml', factor: 1000, type: 'volume' },
  liters: { base: 'ml', factor: 1000, type: 'volume' },
  tsp: { base: 'ml', factor: 4.929, type: 'volume' },
  teaspoon: { base: 'ml', factor: 4.929, type: 'volume' },
  teaspoons: { base: 'ml', factor: 4.929, type: 'volume' },
  tbsp: { base: 'ml', factor: 14.787, type: 'volume' },
  tablespoon: { base: 'ml', factor: 14.787, type: 'volume' },
  tablespoons: { base: 'ml', factor: 14.787, type: 'volume' },
  'fluid-oz': { base: 'ml', factor: 29.5735, type: 'volume' },
  cup: { base: 'ml', factor: 236.588, type: 'volume' },
  cups: { base: 'ml', factor: 236.588, type: 'volume' },
  
  // Count
  each: { base: 'each', factor: 1, type: 'count' },
  piece: { base: 'each', factor: 1, type: 'count' },
  pieces: { base: 'each', factor: 1, type: 'count' },
  unit: { base: 'each', factor: 1, type: 'count' },
  units: { base: 'each', factor: 1, type: 'count' },
};

export function convertUnits(
  value: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const from = fromUnit ? fromUnit.toLowerCase().replace('.', '') : '';
  const to = toUnit ? toUnit.toLowerCase().replace('.', '') : '';

  if (from === to) {
    return value;
  }
  
  const fromConversion = CONVERSIONS[from];
  const toConversion = CONVERSIONS[to];

  if (!fromConversion || !toConversion) {
    console.warn(`Conversion not found for: ${from} or ${to}`);
    return null; // One of the units is not recognized
  }

  if (fromConversion.type !== toConversion.type) {
    console.warn(`Incompatible unit types for conversion: ${from} (${fromConversion.type}) to ${to} (${toConversion.type})`);
    return null; // Units are not of the same type (e.g., weight to volume)
  }

  // Convert `from` unit to its base unit
  const valueInBase = value * fromConversion.factor;
  
  // Convert from base unit to the `to` unit
  const valueInTo = valueInBase / toConversion.factor;
  
  return valueInTo;
}
