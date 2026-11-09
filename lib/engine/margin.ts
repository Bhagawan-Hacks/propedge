/**
 * Margin & Leverage calculations for PropEdge simulated trade engine
 */

export const MAX_PROP_LEVERAGE = 20;

export interface MarginRequirement {
  positionValue: number;
  requiredMargin: number;
  isAllowed: boolean;
  leverage: number;
}

/**
 * Calculates the required margin for an order:
 * Position Value = Size * Price
 * Required Margin = Position Value / Leverage
 */
export function calculateRequiredMargin(
  size: number,
  price: number,
  leverage: number
): MarginRequirement {
  const effectiveLeverage = Math.min(Math.max(1, leverage), MAX_PROP_LEVERAGE);
  const positionValue = size * price;
  const requiredMargin = Math.round((positionValue / effectiveLeverage) * 100) / 100;

  return {
    positionValue,
    requiredMargin,
    isAllowed: effectiveLeverage <= MAX_PROP_LEVERAGE,
    leverage: effectiveLeverage,
  };
}

/**
 * Validates whether the account has sufficient free margin
 */
export function hasSufficientMargin(
  freeMargin: number,
  requiredMargin: number
): boolean {
  return freeMargin >= requiredMargin && requiredMargin > 0;
}
