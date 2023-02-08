export type EasingFunction = (x: number) => number;

export const interpolation = (
  x: number,
  xChange: [number, number],
  yChange: [number, number],
  easingFunction: EasingFunction,
) => {
  return yChange[0] + easingFunction((x - xChange[0]) / (xChange[1] - xChange[0])) * (yChange[1] - yChange[0]);
};

export const clamp: EasingFunction = x => Math.max(Math.min(x, 1), 0);
export const easeOutExpo: EasingFunction = x => clamp(x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

