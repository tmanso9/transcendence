/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
// export default createVuetify({
//   theme: {
//     themes: {
//       light: {
//         colors: {
//           primary: '#1867C0',
//           secondary: '#5CBBF6',
//         },
//       },
//     },
//   },
// })

export default createVuetify({
  theme: {
    defaultTheme: "dark",
    themes: {
      dark: {
        colors: {
          primary: "#582258",
          secondary: "#ffadff",
          warning: "#630438",
        },
      },
    },
  },
  icons: {
    defaultSet: "mdi", // This is already the default value - only for display purposes
  },
});
