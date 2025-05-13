// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'

// UI-библиотека Element Plus и её стили
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Уведомления
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.use(Toast, { position: 'top', timeout: 3000 })
app.mount('#app')
