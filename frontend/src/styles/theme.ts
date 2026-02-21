import { ThemeConfig } from 'antd';

// Earthy Elegant Wedding Theme Colors
export const colors = {
  // Primary palette
  primary: '#B7A89A',       // Dead Sea Clay - buttons, CTAs
  secondary: '#5A534B',     // Deep Stone - headings, primary text
  accent: '#E5CEC0',        // Sunset Haze Peach - highlights, tags
  background: '#F3F1ED',    // Sea Salt Off-White
  cardBg: '#EEE8DF',        // Mineral Paper - card backgrounds

  // Aliases for backward compatibility
  gold: '#B7A89A',          // Alias for primary (Dead Sea Clay)
  cream: '#F3F1ED',         // Alias for background (Sea Salt Off-White)
  primaryLight: '#E5CEC0',  // Sunset Haze Peach

  // Text colors
  textPrimary: '#5A534B',   // Deep Stone - primary text (darkened)
  textSecondary: '#7B756D', // Stone Grey - secondary text (was Warm Taupe)
  textLight: '#F3F1ED',     // Sea Salt Off-White
  white: '#FFFFFF',
  black: '#000000',

  // Status colors (earthy tones, darkened for readability)
  success: '#5B7A5E',       // Earthy Green
  warning: '#A6853A',       // Deep Gold
  error: '#9E5B5B',         // Muted Rose
  info: '#5A534B',          // Deep Stone

  // Extended primary palette (Dead Sea Clay range)
  goldLight: '#D6C7B8',     // Soft Sand Beige
  goldMedium: '#B7A89A',    // Dead Sea Clay
  goldDark: '#7B756D',      // Stone Grey (darkened from Warm Taupe)
  goldPale: '#E5CEC0',      // Sunset Haze Peach

  // Extended secondary palette (Stone Grey range)
  tealLight: '#7B756D',     // Stone Grey
  tealMedium: '#5A534B',    // Deep Stone
  tealDark: '#5A534B',      // Deep Stone
  tealPale: '#F3F1ED',      // Sea Salt Off-White

  // Extended accent palette (Peach range)
  burgundyLight: '#E5CEC0', // Sunset Haze Peach
  burgundyMedium: '#D6C7B8',// Soft Sand Beige
  burgundyDark: '#7B756D',  // Stone Grey (darkened)
  burgundyPale: '#F3F1ED',  // Sea Salt Off-White

  // Cream palette
  creamLight: '#F3F1ED',    // Sea Salt Off-White
  creamMedium: '#EEE8DF',   // Mineral Paper
  creamDark: '#EEE8DF',     // Mineral Paper

  // Gray scale (mapped to earthy tones)
  gray: {
    50: '#F3F1ED',
    100: '#EEE8DF',
    200: '#E5CEC0',
    300: '#D6C7B8',
    400: '#B7A89A',
    500: '#9A9187',
    600: '#7B756D',
    700: '#5A534B',
    800: '#4A433B',
    900: '#3A342D',
  },

  // Borders
  borderGold: 'rgba(183, 168, 154, 0.3)',
  borderLight: 'rgba(123, 117, 109, 0.06)',
};

// Shadows (updated to use earthy tones)
export const shadows = {
  xs: '0 1px 2px rgba(183, 168, 154, 0.06)',
  sm: '0 2px 4px rgba(183, 168, 154, 0.08)',
  md: '0 4px 12px rgba(183, 168, 154, 0.12)',
  lg: '0 8px 24px rgba(183, 168, 154, 0.16)',
  xl: '0 16px 40px rgba(183, 168, 154, 0.2)',
  gold: '0 4px 20px rgba(183, 168, 154, 0.25)',
  card: '0 2px 8px rgba(183, 168, 154, 0.1), 0 1px 2px rgba(0, 0, 0, 0.04)',
  cardHover: '0 8px 24px rgba(183, 168, 154, 0.2), 0 4px 8px rgba(0, 0, 0, 0.08)',
};

// Border radius
export const borderRadius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  round: '50%',
};

// Font families
export const fonts = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  arabic: "'Amiri', 'Traditional Arabic', serif",
  code: "'Fira Code', 'Consolas', monospace",
};

// Ant Design Theme Configuration
export const weddingTheme: ThemeConfig = {
  token: {
    // Primary Colors
    colorPrimary: '#B7A89A',           // Dead Sea Clay - buttons, links
    colorPrimaryHover: '#9A9187',      // Warm Taupe - hover state
    colorPrimaryActive: '#7B756D',     // Stone Grey - active/pressed
    colorPrimaryBg: '#E5CEC0',         // Sunset Haze Peach - light bg
    colorPrimaryBgHover: '#D6C7B8',
    colorPrimaryBorder: '#D6C7B8',
    colorPrimaryBorderHover: '#B7A89A',
    colorPrimaryTextHover: '#9A9187',
    colorPrimaryText: '#B7A89A',
    colorPrimaryTextActive: '#7B756D',

    // Background Colors
    colorBgBase: '#F3F1ED',            // Sea Salt Off-White
    colorBgContainer: '#EEE8DF',       // Mineral Paper - cards
    colorBgElevated: '#FFFFFF',        // White for modals/dropdowns
    colorBgLayout: '#F3F1ED',          // Sea Salt Off-White
    colorBgSpotlight: '#7B756D',       // Stone Grey
    colorBgMask: 'rgba(123, 117, 109, 0.65)',

    // Text Colors (darkened for readability on light backgrounds)
    colorText: '#5A534B',              // Deep Stone - primary text
    colorTextSecondary: '#7B756D',     // Stone Grey - secondary
    colorTextTertiary: '#9A9187',      // Warm Taupe - tertiary
    colorTextQuaternary: '#B7A89A',    // Dead Sea Clay
    colorTextHeading: '#4A433B',       // Dark Earth - headings

    // Border Colors
    colorBorder: '#D6C7B8',            // Soft Sand Beige
    colorBorderSecondary: '#EEE8DF',   // Mineral Paper

    // Status colors (distinct & readable)
    colorSuccess: '#5B7A5E',
    colorSuccessBg: '#F0F5F0',
    colorSuccessBorder: '#A8C5AA',
    colorWarning: '#A6853A',
    colorWarningBg: '#FBF6ED',
    colorWarningBorder: '#D6C7B8',
    colorError: '#9E5B5B',
    colorErrorBg: '#FAF0F0',
    colorErrorBorder: '#D4A8A8',
    colorInfo: '#5A534B',
    colorInfoBg: '#F3F1ED',
    colorInfoBorder: '#D6C7B8',

    // Link
    colorLink: '#B7A89A',
    colorLinkHover: '#9A9187',
    colorLinkActive: '#7B756D',

    // Font
    fontFamily: "'Poppins', 'Playfair Display', -apple-system, sans-serif",
    fontFamilyCode: fonts.code,
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,

    // Font weights
    fontWeightStrong: 600,

    // Line height
    lineHeight: 1.6,
    lineHeightHeading1: 1.3,
    lineHeightHeading2: 1.35,
    lineHeightHeading3: 1.4,
    lineHeightHeading4: 1.45,
    lineHeightHeading5: 1.5,

    // Border Radius
    borderRadius: 8,
    borderRadiusLG: borderRadius.lg,
    borderRadiusSM: borderRadius.sm,
    borderRadiusXS: borderRadius.xs,

    // Box Shadow
    boxShadow: shadows.card,
    boxShadowSecondary: shadows.md,
    boxShadowTertiary: shadows.sm,

    // Control
    controlHeight: 44,
    controlHeightLG: 52,
    controlHeightSM: 36,
    controlHeightXS: 24,

    // Control outline
    controlOutline: 'rgba(183, 168, 154, 0.2)',
    controlOutlineWidth: 2,

    // Line
    lineWidth: 1,
    lineType: 'solid',

    // Motion
    motionDurationFast: '0.1s',
    motionDurationMid: '0.2s',
    motionDurationSlow: '0.3s',
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    motionEaseOut: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    motionEaseOutBack: 'cubic-bezier(0.12, 0.4, 0.29, 1.46)',
    motionEaseInBack: 'cubic-bezier(0.71, -0.46, 0.88, 0.6)',

    // Size
    sizeStep: 4,
    sizeUnit: 4,

    // Padding
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,

    // Margin
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Wire Frame
    wireframe: false,
  },
  components: {
    Button: {
      colorPrimary: '#B7A89A',
      colorPrimaryHover: '#A0937F',
      colorPrimaryActive: '#7B756D',
      colorPrimaryBorder: '#B7A89A',
      primaryShadow: '0 2px 8px rgba(183, 168, 154, 0.3)',
      defaultBorderColor: '#D6C7B8',
      defaultColor: '#5A534B',
      defaultBg: '#EEE8DF',
      defaultGhostColor: '#B7A89A',
      defaultGhostBorderColor: '#B7A89A',
      fontWeight: 500,
      borderRadius: borderRadius.md,
      controlHeight: 44,
      controlHeightLG: 52,
      controlHeightSM: 36,
      paddingInline: 20,
      paddingInlineLG: 28,
    },
    Card: {
      colorBgContainer: '#EEE8DF',
      colorBorderSecondary: '#D6C7B8',
      boxShadowTertiary: shadows.card,
      borderRadiusLG: borderRadius.xl,
      paddingLG: 24,
      headerBg: '#EEE8DF',
      headerFontSize: 18,
      headerFontSizeSM: 16,
    },
    Table: {
      headerBg: '#EEE8DF',
      headerColor: '#4A433B',
      rowHoverBg: '#F3F1ED',
      borderColor: '#D6C7B8',
      headerSplitColor: '#D6C7B8',
      headerBorderRadius: borderRadius.md,
      cellPaddingBlock: 16,
      cellPaddingInline: 16,
    },
    Input: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D6C7B8',
      colorPrimaryHover: '#B7A89A',
      activeBorderColor: '#B7A89A',
      hoverBorderColor: '#B7A89A',
      activeShadow: '0 0 0 2px rgba(183, 168, 154, 0.2)',
      borderRadius: borderRadius.md,
      controlHeight: 44,
      paddingInline: 14,
    },
    Select: {
      colorBgContainer: '#FFFFFF',
      colorBorder: '#D6C7B8',
      colorPrimaryHover: '#B7A89A',
      optionSelectedBg: '#E5CEC0',
      optionActiveBg: '#EEE8DF',
      borderRadius: borderRadius.md,
      controlHeight: 44,
    },
    Menu: {
      colorBgContainer: 'transparent',
      itemBg: 'transparent',
      itemSelectedBg: '#E5CEC0',
      itemSelectedColor: '#7B756D',
      itemHoverBg: '#EEE8DF',
      itemHoverColor: '#7B756D',
      subMenuItemBg: '#F3F1ED',
      itemBorderRadius: borderRadius.md,
      itemMarginInline: 8,
      itemMarginBlock: 4,
      iconSize: 18,
      iconMarginInlineEnd: 12,
    },
    Layout: {
      headerBg: '#FFFFFF',
      headerColor: '#5A534B',
      headerHeight: 64,
      headerPadding: '0 24px',
      bodyBg: '#F3F1ED',
      siderBg: '#EEE8DF',
      triggerBg: '#9A9187',
      triggerColor: '#F3F1ED',
    },
    Modal: {
      contentBg: '#FFFFFF',
      headerBg: '#FFFFFF',
      titleColor: '#4A433B',
      titleFontSize: 20,
      borderRadiusLG: borderRadius.xl,
    },
    Drawer: {
      colorBgElevated: '#FFFFFF',
    },
    Tag: {
      defaultBg: '#E5CEC0',
      defaultColor: '#5A534B',
      borderRadiusSM: borderRadius.sm,
    },
    Badge: {
      colorBgContainer: '#B7A89A',
      textFontSize: 12,
      textFontSizeSM: 10,
    },
    Tabs: {
      itemSelectedColor: '#B7A89A',
      itemHoverColor: '#9A9187',
      itemActiveColor: '#7B756D',
      inkBarColor: '#B7A89A',
      cardBg: '#F3F1ED',
      cardPadding: '12px 16px',
    },
    Statistic: {
      titleFontSize: 14,
      contentFontSize: 28,
      fontFamily: fonts.heading,
      titleColor: '#7B756D',
      contentColor: '#4A433B',
    },
    Form: {
      labelColor: '#5A534B',
      labelFontSize: 14,
      labelHeight: 32,
      verticalLabelPadding: '0 0 8px',
      itemMarginBottom: 24,
    },
    Typography: {
      titleMarginBottom: '0.5em',
      titleMarginTop: '1.2em',
      fontFamilyCode: fonts.code,
    },
    Divider: {
      colorSplit: '#D6C7B8',
      orientationMargin: 0.05,
    },
    Tooltip: {
      colorBgSpotlight: '#7B756D',
      colorTextLightSolid: '#F3F1ED',
      borderRadius: borderRadius.md,
    },
    Progress: {
      defaultColor: '#B7A89A',
      remainingColor: '#EEE8DF',
      circleTextFontSize: '1em',
    },
    Steps: {
      colorPrimary: '#B7A89A',
      navArrowColor: '#D6C7B8',
    },
    Timeline: {
      dotBg: '#EEE8DF',
      dotBorderWidth: 2,
      itemPaddingBottom: 24,
    },
    Avatar: {
      colorBgBase: '#EEE8DF',
      colorTextPlaceholder: '#7B756D',
    },
    Breadcrumb: {
      lastItemColor: '#5A534B',
      linkColor: '#7B756D',
      linkHoverColor: '#B7A89A',
      separatorColor: '#B7A89A',
    },
    Collapse: {
      headerBg: '#F3F1ED',
      contentBg: '#EEE8DF',
    },
    Popover: {
      colorBgElevated: '#FFFFFF',
    },
    Dropdown: {
      colorBgElevated: '#FFFFFF',
      controlItemBgHover: '#EEE8DF',
      controlItemBgActive: '#E5CEC0',
    },
    Upload: {
      colorBorder: '#D6C7B8',
      colorPrimaryHover: '#B7A89A',
    },
    DatePicker: {
      controlHeight: 44,
      cellHoverBg: '#EEE8DF',
      cellActiveWithRangeBg: '#E5CEC0',
    },
    Calendar: {
      itemActiveBg: '#E5CEC0',
    },
    Spin: {
      colorPrimary: '#B7A89A',
    },
    Switch: {
      colorPrimary: '#B7A89A',
      colorPrimaryHover: '#9A9187',
      trackHeight: 22,
      trackMinWidth: 44,
      trackPadding: 2,
      handleSize: 18,
    },
    Checkbox: {
      colorPrimary: '#B7A89A',
      colorPrimaryHover: '#9A9187',
    },
    Radio: {
      colorPrimary: '#B7A89A',
      colorPrimaryHover: '#9A9187',
    },
    Slider: {
      colorPrimaryBorderHover: '#9A9187',
      handleColor: '#B7A89A',
      handleActiveColor: '#7B756D',
      trackBg: '#B7A89A',
      trackHoverBg: '#9A9187',
    },
    Rate: {
      colorFillContent: '#D6C7B8',
      starColor: '#B7A89A',
    },
    Alert: {
      colorSuccessBg: '#F3F1ED',
      colorSuccessBorder: '#D6C7B8',
      colorWarningBg: '#F3F1ED',
      colorWarningBorder: '#D6C7B8',
      colorErrorBg: '#F3F1ED',
      colorErrorBorder: '#D6C7B8',
      colorInfoBg: '#F3F1ED',
      colorInfoBorder: '#D6C7B8',
    },
    Message: {
      contentBg: '#FFFFFF',
    },
    Notification: {
      colorBgElevated: '#FFFFFF',
    },
    Result: {
      titleFontSize: 24,
      subtitleFontSize: 14,
    },
    Empty: {
      colorTextDescription: '#7B756D',
    },
    Pagination: {
      itemBg: '#EEE8DF',
      itemActiveBg: '#B7A89A',
    },
  },
};

// Keep backward-compatible export
export const arabicLuxuryTheme = weddingTheme;

export default weddingTheme;
