import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const styles = {
  global: (props) => ({
    body: {
      bg: colors.light,
    },
  }),
};

const components = {

};

const fonts = {
  heading: "'M PLUS Rounded 1c'",
  text: "'Share Tech Mono'"
};

const colors = {
  light: "#FDF5DF",
  aqua: "#5EBEC4",
  raspberry: "#F92C85",
};

const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

const theme = extendTheme({
  config,
  styles,
  components,
  colors,
  fonts,
});

export default theme;