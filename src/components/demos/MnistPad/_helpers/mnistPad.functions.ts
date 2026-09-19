export interface Pixel {
  x: number;
  y: number;
  ink: string;
}

const levels = 9;

export const pixels = (rows: readonly string[]): Pixel[] =>
  rows.flatMap((row, y) =>
    [...row]
      .map((value, x) => ({ x, y, level: Number(value) }))
      .filter(pixel => pixel.level > 0)
      .map(({ x, level }) => ({ x, y, ink: (level / levels).toFixed(2) })),
  );
