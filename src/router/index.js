import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore'; // Import authStore
import { auth } from '../firebase'; // Assuming Firebase auth is imported
import { onAuthStateChanged } from 'firebase/auth'; // Use Firebase auth state listener

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('../views/LoginView.vue') },
  {
    path: '/admin-panel',
    component: () => import('../views/AdminPanel.vue'),
    children: [
      { path: '', component: () => import('../components/profiles/AdminPage.vue') },
      { path: 'reports', component: () => import('../components/AdminComponents/Reports.vue') },
      { path: 'settings', component: () => import('../components/AdminComponents/Settings.vue') },
    ],
    meta: { requiresAdmin: true, role: 'Admin' },
  },
  {
    path: '/user-panel',
    component: () => import('../views/UserPanel.vue'),
    children: [
      { path: 'kinshasa', component: () => import('../components/profiles/KinshasaPage.vue') },
      { path: 'brazzaville', component: () => import('../components/profiles/BrazzaPage.vue') },
    ],
    meta: { requiresAuth: true, role: 'Attendant' },
  },
  {
    path: '/shop-panel',
    component: () => import('../views/ShopPanel.vue'),
    children: [
      { path: 'sales', component: () => import('../components/shop/SalesForm.vue') },
    ],
    meta: { requiresAuth: true, role: 'Shop' },
  },
  { path: '/unauthorized', component: () => import('../components/unAuthorized.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

let isFirebaseAuthReady = false;

const waitForAuth = () => new Promise((resolve) => {
  if (isFirebaseAuthReady) {
    resolve(auth.currentUser);
  } else {
    onAuthStateChanged(auth, (user) => {
      isFirebaseAuthReady = true;
      resolve(user);
    });
  }
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const user = await waitForAuth();

  if (user && !authStore.userDetails) {
    // Fetch user details if not already fetched
    await authStore.fetchUserDetails();
  }

  if (authStore.isLoading) {
    // Wait for user details to load before proceeding
    return;
  }

  if (to.meta.requiresAdmin && authStore.userDetails?.role !== 'Admin') {
    return next('/login');
  }

  if (to.meta.requiresAuth && to.meta.role && authStore.userDetails?.role !== to.meta.role) {
    return next('/login');
  }

  if (!user && to.meta.requiresAuth) {
    return next('/login');
  }

  next();
});

export default router;
