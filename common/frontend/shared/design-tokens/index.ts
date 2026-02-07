/**
 * Design Tokens Type Definitions
 * 设计令牌类型定义
 *
 * Design System: Enterprise Workspace
 * Version: 1.0.0
 */

// ============================================================================
// Core Token Types - 核心令牌类型
// ============================================================================

export interface ColorToken {
  value: string;
  type: 'color';
  description?: string;
}

export interface SpacingToken {
  value: string;
  type: 'spacing';
  description?: string;
}

export interface SizingToken {
  value: string;
  type: 'sizing';
  description?: string;
}

export interface FontSizeToken {
  value: string;
  type: 'fontSize';
  lineHeight?: string;
  description?: string;
}

export interface FontWeightToken {
  value: number;
  type: 'fontWeight';
  description?: string;
}

export interface LetterSpacingToken {
  value: string;
  type: 'letterSpacing';
  description?: string;
}

export interface DurationToken {
  value: string;
  type: 'duration';
  description?: string;
}

export interface EasingToken {
  value: string;
  type: 'transitionTimingFunction';
  description?: string;
}

export interface TransitionPropertyToken {
  value: string;
  type: 'transitionProperty';
  description?: string;
}

export interface ShadowToken {
  value: string;
  type: 'boxShadow';
  description?: string;
}

export interface BorderRadiusToken {
  value: string;
  type: 'borderRadius';
  description?: string;
}

export interface BlurToken {
  value: string;
  type: 'other';
  description?: string;
}

export interface OpacityToken {
  value: number;
  type: 'opacity';
  description?: string;
}

export interface ZIndexToken {
  value: number;
  type: 'number';
  description?: string;
}

// ============================================================================
// Gray Scale Colors - 灰度颜色
// ============================================================================

export interface GrayScaleColors {
  50: string;
  100: string;
  150?: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

// ============================================================================
// Semantic Colors - 语义颜色
// ============================================================================

export interface SemanticColorSet {
  light: string;
  main: string;
  dark: string;
  contrast: string;
}

export interface SemanticColors {
  success: SemanticColorSet;
  warning: SemanticColorSet;
  error: SemanticColorSet;
  info: SemanticColorSet;
}

// ============================================================================
// Typography - 排版
// ============================================================================

export interface FontFamilyTokens {
  sans: string;
  serif?: string;
  mono: string;
}

export interface LineHeightTokens {
  none: string;
  tight: string;
  snug?: string;
  normal: string;
  relaxed: string;
  loose: string;
}

export interface FontWeightTokens {
  thin?: number;
  extralight?: number;
  light?: number;
  normal: number;
  medium: number;
  semibold: number;
  bold: number;
  extrabold?: number;
  black?: number;
}

export interface LetterSpacingTokens {
  tighter?: string;
  tight: string;
  normal: string;
  wide?: string;
  wider?: string;
}

export interface TypographyTokens {
  fontFamily: FontFamilyTokens;
  fontSize: Record<string, string>;
  lineHeight: LineHeightTokens;
  fontWeight: FontWeightTokens;
  letterSpacing?: LetterSpacingTokens;
}

// ============================================================================
// Transitions - 过渡
// ============================================================================

export interface TransitionTokens {
  duration: Record<string, string>;
  easing: Record<string, string>;
  property?: Record<string, string>;
}

// ============================================================================
// Layout - 布局
// ============================================================================

export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl'?: string;
}

export interface ContainerSizes {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface GridColumns {
  desktop: number;
  laptop?: number;
  tablet: number;
  mobile: number;
}

export interface GridGap {
  sm?: string;
  md: string;
  lg?: string;
}

// ============================================================================
// Component Tokens - 组件令牌
// ============================================================================

export interface ButtonTokens {
  height: Record<string, string>;
  paddingX: Record<string, string>;
  radius: string | { value: string; type: string; description?: string };
  fontSize: Record<string, string>;
  fontWeight?: { value: string | number; type: string; description?: string };
  transition?: { duration: string; description?: string };
  primary: {
    background: { value: string; type: string; description?: string };
    text: { value: string; type: string; description?: string };
    border?: { value: string; type: string; description?: string };
    hover: {
      background: { value: string; type: string; description?: string };
    };
  };
  secondary: {
    background: { value: string; type: string; description?: string };
    text: { value: string; type: string; description?: string };
    hover?: {
      background: { value: string; type: string; description?: string };
    };
  };
  ghost?: {
    background: string;
    text: { value: string; type: string; description?: string };
    hover: {
      background: { value: string; type: string; description?: string };
    };
  };
}

export interface InputTokens {
  height: Record<string, string>;
  paddingX: { value: string; type: string; description?: string };
  radius: { value: string; type: string; description?: string };
  fontSize: { value: string; type: string; description?: string };
  background?: { value: string; type: string; description?: string };
  border: { value: string; type: string; description?: string };
  borderFocus: { value: string; type: string; description?: string };
  text: { value: string; type: string; description?: string };
  placeholder: { value: string; type: string; description?: string };
  fontMono?: boolean;
}

export interface CardTokens {
  padding: { value: string; type: string; description?: string };
  paddingSm?: { value: string; type: string; description?: string };
  radius: { value: string; type: string; description?: string };
  shadow: { value: string; type: string; description?: string };
  background: { value: string; type: string; description?: string };
}

export interface TableTokens {
  header: {
    height: { value: string; type: string; description?: string };
    background: { value: string; type: string; description?: string };
    text: { value: string; type: string; description?: string };
    fontWeight: { value: string | number; type: string; description?: string };
  };
  row: {
    height: { value: string; type: string; description?: string };
    hover: { background: { value: string; type: string; description?: string } };
    stripe: { background: { value: string; type: string; description?: string } };
  };
  cell: {
    padding: { value: string; type: string; description?: string };
    border: { value: string; type: string; description?: string };
  };
  radius: { value: string; type: string; description?: string };
}

export interface PaginationTokens {
  button: {
    size: { value: string; type: string; description?: string };
    radius: { value: string; type: string; description?: string };
  };
  active: {
    background: { value: string; type: string; description?: string };
    text: { value: string; type: string; description?: string };
  };
}

export interface BreadcrumbTokens {
  separator: { value: string; type: string; description?: string };
  link: {
    color: { value: string; type: string; description?: string };
    hover: { color: { value: string; type: string; description?: string } };
  };
  current: { color: { value: string; type: string; description?: string } };
}

export interface TabsTokens {
  height: { value: string; type: string; description?: string };
  padding: { horizontal: { value: string; type: string; description?: string } };
  active: {
    border: { value: string; type: string; description?: string };
    text: { value: string; type: string; description?: string };
  };
  inactive: { text: { value: string; type: string; description?: string } };
}

export interface SelectTokens {
  dropdown: {
    radius: { value: string; type: string; description?: string };
    shadow: { value: string; type: string; description?: string };
  };
  option: {
    height: { value: string; type: string; description?: string };
    padding: { value: string; type: string; description?: string };
    hover: { background: { value: string; type: string; description?: string } };
    selected: { background: { value: string; type: string; description?: string } };
  };
}

export interface CheckboxTokens {
  size: { value: string; type: string; description?: string };
  radius: { value: string; type: string; description?: string };
  checked: {
    background: { value: string; type: string; description?: string };
    border: { value: string; type: string; description?: string };
  };
}

export interface RadioTokens {
  size: { value: string; type: string; description?: string };
  checked: { background: { value: string; type: string; description?: string } };
}

export interface SwitchTokens {
  track: {
    width: { value: string; type: string; description?: string };
    height: { value: string; type: string; description?: string };
    radius: { value: string; type: string; description?: string };
  };
  thumb: {
    size: { value: string; type: string; description?: string };
    radius: { value: string; type: string; description?: string };
  };
}

export interface AlertTokens {
  padding: { value: string; type: string; description?: string };
  radius: { value: string; type: string; description?: string };
  icon: { size: { value: string; type: string; description?: string } };
}

export interface LoadingTokens {
  spinner: {
    size: Record<string, string>;
  };
}

export interface ModalTokens {
  padding: { value: string; type: string; description?: string };
  radius: { value: string; type: string; description?: string };
  shadow?: { value: string; type: string; description?: string };
  background?: { value: string; type: string; description?: string };
  border?: { value: string; type: string; description?: string };
}

export interface TooltipTokens {
  padding: { value: string; type: string; description?: string };
  radius: { value: string; type: string; description?: string };
  fontSize: { value: string; type: string; description?: string };
  shadow?: { value: string; type: string; description?: string };
  background?: { value: string; type: string; description?: string };
  border?: { value: string; type: string; description?: string };
}

export interface TagTokens {
  paddingX: { value: string; type: string; description?: string };
  paddingY: { value: string; type: string; description?: string };
  radius: { value: string; type: string; description?: string };
  fontSize: { value: string; type: string; description?: string };
}

// ============================================================================
// Glass Theme Types - 玻璃态主题类型
// ============================================================================

export interface GlassBackgroundColors {
  primary: string;
  secondary: string;
  tertiary?: string;
  card: string;
  cardHover?: string;
  overlay: string;
  modal: string;
}

export interface GlassTextColors {
  primary: string;
  secondary: string;
  muted: string;
  disabled: string;
  placeholder: string;
}

export interface GlassBorderColors {
  light: string;
  medium: string;
  focus: string;
}

export interface GlassInteractiveColors {
  hover: string;
  active: string;
  focus: string;
  selected: string;
}

export interface GlassColors {
  background: GlassBackgroundColors;
  text: GlassTextColors;
  border: GlassBorderColors;
  interactive: GlassInteractiveColors;
  status: Record<string, string>;
}

export interface GlassEffects {
  'backdrop-blur': Record<string, string>;
  shadow: Record<string, string>;
  'border-radius': Record<string, string>;
  opacity: Record<string, number>;
}

export interface GlassComponentTokens {
  card: {
    padding: string;
    paddingLg?: string;
    radius: string;
    shadow: string;
    blur: string;
    background: string;
    border: string;
    transition: string;
  };
  button: Record<string, any>;
  input: Record<string, any>;
  navbar: {
    height: string;
    paddingX: string;
    blur: string;
    background: string;
  };
  sidebar: {
    width: string;
    collapsedWidth: string;
    itemHeight: string;
    padding: string;
  };
  modal: {
    padding: string;
    radius: string;
    blur: string;
    shadow: string;
  };
  popup: {
    padding: string;
    radius: string;
    blur: string;
    shadow: string;
  };
  dropdown: {
    padding: string;
    radius: string;
    shadow: string;
  };
  pagination: {
    buttonSize: string;
    radius: string;
  };
  table: {
    headerHeight: string;
    rowHeight: string;
    padding: string;
    radius: string;
  };
  tag: {
    paddingX: string;
    paddingY: string;
    radius: string;
    fontSize: string;
  };
  badge: Record<string, any>;
  tooltip: {
    padding: string;
    radius: string;
    fontSize: string;
  };
}

export interface GlassTokens {
  color: GlassColors;
  effect: GlassEffects;
  typography: Record<string, any>;
  component: GlassComponentTokens;
}

// ============================================================================
// Minimal Theme Types - Minimal 极简主题类型
// ============================================================================

export interface MinimalPrimaryColors {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

export interface MinimalNeutralColors {
  white: string;
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950?: string;
}

export interface MinimalBackgroundColors {
  default: string;
  secondary: string;
  tertiary: string;
  card: string;
  overlay: string;
}

export interface MinimalTextColors {
  primary: string;
  secondary: string;
  tertiary: string;
  muted: string;
  disabled: string;
  placeholder: string;
  inverse: string;
}

export interface MinimalBorderColors {
  light: string;
  medium: string;
  dark: string;
  focus: string;
}

export interface MinimalInteractiveColors {
  hover: string;
  active: string;
  focus: string;
  selected: string;
}

export interface MinimalColors {
  primary: MinimalPrimaryColors;
  neutral: MinimalNeutralColors;
  background: MinimalBackgroundColors;
  text: MinimalTextColors;
  border: MinimalBorderColors;
  interactive: MinimalInteractiveColors;
  status: Record<string, string>;
}

export interface MinimalEffects {
  shadow: Record<string, string>;
  'border-radius': Record<string, string>;
  opacity: Record<string, number>;
}

export interface MinimalLayoutTokens {
  sidebar: {
    width: {
      expanded: string;
      collapsed: string;
      mini: string;
    };
    height: string;
    itemHeight: string;
    logoHeight: string;
    transitionDuration: string;
  };
  navbar: {
    height: string;
    paddingHorizontal: string;
    breadcrumbGap: string;
  };
  content: {
    padding: string;
    paddingLg: string;
  };
  container: {
    maxWidth: string;
    paddingHorizontal: string;
  };
  grid: {
    columns: GridColumns;
    gap: GridGap;
  };
  breakpoint: Breakpoints;
  zIndex: Record<string, number>;
}

export interface MinimalComponentTokens {
  button: ButtonTokens;
  input: InputTokens;
  card: CardTokens;
  table: TableTokens;
  pagination: PaginationTokens;
  breadcrumb: BreadcrumbTokens;
  tabs: TabsTokens;
  select: SelectTokens;
  checkbox: CheckboxTokens;
  radio: RadioTokens;
  switch: SwitchTokens;
  alert: AlertTokens;
  loading: LoadingTokens;
  modal: ModalTokens;
  tooltip: TooltipTokens;
  tag: TagTokens;
}

export interface MinimalTokens {
  color: MinimalColors;
  effect: MinimalEffects;
  layout: MinimalLayoutTokens;
  component: MinimalComponentTokens;
}

// ============================================================================
// Export Types - 导出类型
// ============================================================================

export {
  GlassTokens,
  GlassColors,
  GlassEffects,
  GlassComponentTokens,
  MinimalTokens,
  MinimalColors,
  MinimalEffects,
  MinimalLayoutTokens,
  MinimalComponentTokens,
};
