import { Montserrat } from 'next/font/google';
import localFont from "next/font/local";

const BoldFont = localFont({
  src: [{ path: "../assets/fonts/the_bold_font/THE BOLD FONT - FREE VERSION - 2023.ttf" }],
  variable: "--font-boldfont",
});

const MontserratFont = Montserrat({ subsets: ["latin"], variable: '--font-montserrat'})



// const ClashDisplay = localFont({
//   src: [
//     {
//       path: "../assets/fonts/clashdisplay/ClashDisplay-Extralight.otf",
//       weight: "200",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/clashdisplay/ClashDisplay-Light.otf",
//       weight: "300",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/clashdisplay/ClashDisplay-Regular.otf",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/clashdisplay/ClashDisplay-Medium.otf",
//       weight: "500",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/clashdisplay/ClashDisplay-Semibold.otf",
//       weight: "600",
//       style: "normal",
//     },
//     {
//       path: "../assets/fonts/clashdisplay/ClashDisplay-Bold.otf",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-clash-display",
// });

export { BoldFont, MontserratFont };