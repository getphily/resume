import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'system',
  useSystemColorMode: true,
};

const colors = {
  brand: {
    primary: {
      light: 'oklch(55% 0.16 260)', // Royal Indigo
      dark: 'oklch(75% 0.15 200)',  // Electric Cyan
    },
    secondary: {
      light: 'oklch(50% 0.18 200)', // Slate Cyan
      dark: 'oklch(65% 0.20 280)',  // Bright Violet
    },
  },
};

const styles = {
  global: (props) => ({
    body: {
      fontFamily: 'var(--font-body)',
      bg: props.colorMode === 'dark' ? 'oklch(14% 0.01 240)' : 'oklch(98% 0.005 240)',
      color: props.colorMode === 'dark' ? 'oklch(93% 0.01 240)' : 'oklch(25% 0.01 240)',
      transitionProperty: 'background-color, color',
      transitionDuration: '0.2s',
      lineHeight: 'base',
    },
    '*::placeholder': {
      color: props.colorMode === 'dark' ? 'oklch(65% 0.01 240)' : 'oklch(50% 0.01 240)',
    },
    '*, *::before, &::after': {
      borderColor: props.colorMode === 'dark' ? 'oklch(28% 0.015 240 / 0.7)' : 'oklch(90% 0.01 240)',
    },
  }),
};

const fonts = {
  heading: `'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
};

// Custom components or semantic tokens can go here
const components = {
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'oklch(18% 0.015 240 / 0.65)' : 'oklch(100% 0 0 / 0.7)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid',
        borderColor: props.colorMode === 'dark' ? 'oklch(28% 0.015 240 / 0.7)' : 'oklch(90% 0.01 240)',
        borderRadius: '2xl',
        boxShadow: props.colorMode === 'dark' ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      },
    }),
  },
};

const theme = extendTheme({
  config,
  colors,
  styles,
  fonts,
  components,
});

export default theme;
