const theme = {
  colors: {
    primary: "#BB86FC",
    secondary: "#03DAC6",
    primaryVariant: "#3700B3",
    background: "#121212",
    surface: "#121212",
    error: "#CF6679",
    onPrimary: "#000000",
    onSecondary: "#000000",
    onBackground: "#FFFFFF",
    onSurface: "#FFFFFF",
    onError: "#000000",
    elevation: {
      dp00: 0,
      dp01: 0.05,
      dp02: 0.07,
      dp03: 0.08,
      dp04: 0.09,
      dp06: 0.11,
      dp08: 0.12,
      dp12: 0.14,
      dp16: 0.15,
      dp24: 0.16,
    },
  },
  spacing: [
    0,
    0.25,
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2,
    2.5,
    3,
    4,
    5,
    6,
    8,
    10,
    12,
    14,
  ].map((v) => {
    return `${v}rem`;
  }),
};

// map elevation percentage to color
Object.entries(theme.colors.elevation).forEach(([key, value]) => {
  theme.colors.elevation[key] = `rgba(255, 255, 255, ${value})`;
});

export default theme;
