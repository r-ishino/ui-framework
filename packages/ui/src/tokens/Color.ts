type ValueOf<T> = T[keyof T];
export const color = {
  inherit: 'inherit',
  // gray scales
  gray100: '#fafafa',
  gray200: '#f5f5f5',
  gray300: '#eeeeee',
  gray400: '#e0e0e0',
  gray500: '#bdbdbd',
  gray600: '#737373',
  gray700: '#565656',
  gray800: '#333333',
  gray900: '#181818',
  border: '#e0e0e0', // gray-400
  subBorder: '#eeeeee', // gray-300
  subText: '#737373', // gray-600
  text: '#181818', // gray-900
  placeholder: '#bdbdbd', // gray-500
  baseBackground: '#fafafa', // gray100
  black: '#181818',
  white: '#ffffff',
  // semantics
  semanticPrimary: '#0072e5',
  semanticPrimary500: '#4d9ad7',
  semanticPrimary100: '#e6f0f9',
  semanticLink: '#0072e5',
  semanticLink500: '#4d9ad7', // link hover
  semanticLink100: '#e6f0f9',
  semanticPositive: '#58a942',
  semanticPositive500: '#ABD4A0',
  semanticPositive100: '#EEF6EC',
  semanticWarning: '#f0ad4e',
  semanticWarning500: '#F7D6A7',
  semanticWarning100: '#FDF7ED',
  semanticNegative: '#DF4141',
  semanticNegative500: '#F9A19B',
  semanticNegative100: '#FEECEB',
  semanticInfo: '#1646F2',
  semanticInfo100: '#F1F3FF',
  // primary brand colors
  primaryBlueGray: '#12486B',
  primaryBlueGray500: '#597F97',
  primaryBlueGray200: '#D8DFE5',
  primaryBlueGray100: '#EDF0F2',
  primaryBlueGray50: '#F3F6F7',
  // secondary brand colors
  secondaryPink: '#B82987',
  secondaryPink500: '#DB94C3',
  secondaryPink100: '#F8EAF3',
  secondaryPink50: '#FBF4F9'
} as const satisfies {
  [key: string]: string;
};

export type Color = keyof typeof color;
export type ColorValue = ValueOf<typeof color>;

export const toColorValue = (argColor: Color | null | undefined): ColorValue =>
  argColor == null ? color.inherit : color[argColor];
