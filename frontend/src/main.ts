/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

import "./assets/main.css";

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Composables
import { createApp } from "vue";

const app = createApp(App);

registerPlugins(app);
app.config.warnHandler = function (msg, vm, trace) {
  if (msg.includes("Extraneous non-emits event listeners (chat)")) {
    return;
  }
  console.warn(msg, trace);
};

app.mount("#app");
