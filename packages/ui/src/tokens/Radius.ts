type ValueOf<T> = T[keyof T];

export const borderRadius = {
  none: '0px',
  s: '2px',
  m: '4px',
  l: '8px',
  circle: '9999px'
} as const satisfies {
  [key: string]: string;
};

export type BorderRadius = keyof typeof borderRadius;
export type BorderRadiusValue = ValueOf<typeof borderRadius>;

export const toBorderRadiusValue = (
  argBorderRadius: BorderRadius | null | undefined
): BorderRadiusValue =>
  argBorderRadius === null || argBorderRadius === undefined
    ? borderRadius.none
    : borderRadius[argBorderRadius];
