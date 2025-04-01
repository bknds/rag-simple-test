import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
// styles
import "~/styles/root.scss";
// 引入组件库的少量全局样式变量
import "tdesign-vue-next/es/style/index.css";
import "~/styles/theme.css";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components: {
      ...components,
    },
    ssr: true,
    theme: {
      defaultTheme: "light",
    },
  });
  nuxtApp.vueApp.use(vuetify);
});
