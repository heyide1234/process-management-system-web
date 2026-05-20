import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import vform from 'vform3-builds'
import 'vform3-builds/dist/designer.style.css'

const app = createApp(App)
app.use(ElementPlus)
app.use(vform)
app.use(router)
app.mount('#app')