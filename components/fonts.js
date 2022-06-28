import { Global } from "@emotion/react";

const Fonts = () => (
    <Global styles={`
      @import url('https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;700&display=swap');
      @import url("https://fonts.googleapis.com/css2?family=Cutive+Mono&family=Goblin+One&family=Share+Tech+Mono&family=Special+Elite&family=Syne+Mono&family=VT323&display=swap");

      @font-face {
        font-family: 'Bookman Opti Bold';
        font-style: bold,
        font-weight: 900,
        src: url('../fonts/BOOKmanOpti-Bold.otf') format('otf')
      }
    `} />
  )
  export default Fonts