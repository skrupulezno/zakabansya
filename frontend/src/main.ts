// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from '@/App.vue'

// Уведомления
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

import '@/styles.css'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faBars,
  faTasks,
  faList,
  faFolderOpen,
  faFolder,
  faFile,
  faPlusSquare,
  faArchive,
  faTh,
  faUserPlus,
  faBell,
  faQuestionCircle,
  faSearch,
  faMagic,
  faThLarge,
  faChevronRight,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons'

// Регистрируем все иконки:
library.add(
  faBars,
  faTasks,
  faList,
  faFolderOpen,
  faFolder,
  faFile,
  faPlusSquare,
  faArchive,
  faTh,
  faUserPlus,
  faBell,
  faQuestionCircle,
  faSearch,
  faMagic,
  faThLarge,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faSpinner,
  faPlus,
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 20,
  newestOnTop: true,
})

app.mount('#app')
