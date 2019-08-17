import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueSocketIO from 'vue-socket.io'
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(BootstrapVue)
Vue.use(VueAxios, axios);
Vue.use(new VueSocketIO({
  debug: process.env.VUE_APP_DEBUG,
  connection: process.env.VUE_APP_SOCKET,
  vuex: {
      store,
      actionPrefix: 'SOCKET_',
      mutationPrefix: 'SOCKET_'
  }
}))

import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
