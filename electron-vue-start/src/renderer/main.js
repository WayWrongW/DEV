import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import mqtt from "mqtt"

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.mqtt = Vue.prototype.$mqtt = mqtt
Vue.client = Vue.prototype.$client = mqtt.connect('ws://www.zhushi-tech.com:8083/mqtt'),

  /* eslint-disable no-new */
  new Vue({
    components: { App },
    router,
    store,
    template: '<App/>'
  }).$mount('#app')
