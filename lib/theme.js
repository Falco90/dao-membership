import { extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { keyframes } from "@chakra-ui/react";

const styles = {
  global: (props) => ({
    body: {
      // bg: colors.light,
      bgGradient: `linear-gradient(to-b, #F0C27B, #4B1248 200%)`,
      height: "100vh"
      // height: window.innerHeight,
    },
  }),
};

const components = {

};

const fonts = {
  heading: "'Share Tech Mono'",
  body: "'Share Tech Mono'"
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