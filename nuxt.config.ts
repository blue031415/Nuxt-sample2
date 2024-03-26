// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path"
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig:{
    public: {
      SUPABASE_URL:process.env.SUPABASE_URL,
      SUPABASE_KEY:process.env.SUPABASE_KEY,
    },
  },

  vite:{
    resolve: {
      alias:{
        "@":path.resolve(__dirname, "./"),
      },
    },
  },

  plugins:[
    '~/plugins/supabase.ts'
  ],

  modules: ["@nuxt/image"]
})