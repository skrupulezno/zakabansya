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
  faPenToSquare,
  faBars,
  faTrash,
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
  faWrench,
  faGripVertical,
} from '@fortawesome/free-solid-svg-icons'

// Регистрируем все иконки:
library.add(
  faWrench,
  faPenToSquare,
  faBars,
  faTasks,
  faList,
  faFolderOpen,
  faFolder,
  faFile,
  faTrash,
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
  faGripVertical,
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(Toast, {
  transition: 'Vue-Toastification__bounce',
  maxToasts: 3,
  newestOnTop: true,
})

app.mount('#app')
