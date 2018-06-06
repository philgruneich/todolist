import Vue from 'vue';
import Tasks from './app/Tasks.vue';

import './index.scss';
import VueRouter from 'vue-router';
Vue.use(VueRouter);

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      components: {
        default: Tasks
      }
    }
  ]
});

export default new Vue({
  el: '#root',
  router,
  render: h => h('router-view')
});
