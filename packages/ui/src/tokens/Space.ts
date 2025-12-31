type ValueOf<T> = T[keyof T];

export const space = {
  negativeM: '-16px',
  zero: '0px',
  xxs: '4px',
  xs: '8px',
  s: '12px',
  m: '16px',
  l: '24px',
  xl: '32px',
  xxl: '40px'
} as const satisfies {
  [key: string]: string;
};

export type Space = keyof typeof space;
export type SpaceValue = ValueOf<typeof space>;

export const toSpaceValue = (argSpace: Space | null | undefined): SpaceValue =>
  argSpace === null || argSpace === undefined ? space.zero : space[argSpace];
