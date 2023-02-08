export type EasingFunction = (x: number) => number;

export const interpolation = (
  x: number,
  xChange: [number, number],
  yChange: [number, number],
  easingFunction: EasingFunction,
) => {
  return yChange[0] +
    easingFunction((x - xChange[0]) / (xChange[1] - xChange[0])) *
      (yChange[1] - yChange[0]);
};

export const clamp: EasingFunction = (x) => Math.max(Math.min(x, 1), 0);
export const easeOutExpo: EasingFunction = (x) =>
  clamp(x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

export const animation = async (
  change: [number, number],
  ms: number,
  action: (y: number) => Promise<void>,
  easingFunction: EasingFunction,
) => {
  await action(change[0]);
  const startTime = Date.now();
  while (Date.now() - startTime <= ms) {
    await action(
      interpolation(
        Date.now(),
        [startTime, startTime + ms],
        change,
        easingFunction,
      ),
    );
  }
  await action(change[1]);
};

export class Animation {
  change: [[number, number], [number, number]] | null = null;

  constructor(public action: (y: number) => Promise<void>) {}

  async moveTo(
    change: [number, number],
    ms: number,
    easingFunction: EasingFunction,
  ) {
    if (this.change !== null) {
      this.change = [[
        interpolation(
          Date.now(),
          this.change[1],
          this.change[0],
          easingFunction,
        ),
        change[1],
      ], [Date.now(), Date.now() + ms]];
      return;
    }
    this.change = [change, [Date.now(), Date.now() + ms]];

    this.action(this.change[0][0]);

    while (Date.now() <= this.change[1][1]) {
      await this.action(
        interpolation(
          Date.now(),
          this.change[1],
          this.change[0],
          easingFunction,
        ),
      );
    }

    this.action(this.change[0][1]);

    this.change = null;
  }
}
