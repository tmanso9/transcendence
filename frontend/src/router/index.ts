import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import AboutView from '../views/AboutView.vue';
import RankingView from '@/views/RankingView.vue';
import TwoFAView from '../views/TwoFAView.vue';
import FirstLoginView from '../views/FirstLoginView.vue';
import AccountView from '../views/AccountView.vue';
import NotFound from '../views/NotFound.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/about",
      name: "about",
      component: AboutView,
    },
    {
      path: "/play",
      component: () => import('../views/PlayView.vue'),
      // component : PlayView,
    },
    {
      path: '/game',
      // component: GameView,
      component: () => import('../views/GameView.vue')
    },
    {
      path: "/ranking",
	  name: "ranking",
      component: RankingView,
    },
    {
      path: "/2fa",
	  name: "2fa",
      component: TwoFAView,
    },
    {
      path: "/firstLogin",
	  name: "firstLogin",
      component: FirstLoginView,
    },
    {
      path: "/users/:username",
	  name: "account",
      component: AccountView,
    },
    {
      path: "/:catchAll(.*)",
	  name: "catchAll",
      component: NotFound,
    },
  ],
});

export default router
