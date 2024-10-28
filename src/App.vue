<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from './stores/authStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();  // Access the auth store
const router = useRouter();  // Access the router
let idleTimeout;

// Function to reset the idle timer
const resetIdleTimer = () => {
  clearTimeout(idleTimeout);  // Clear the existing timeout
  
  // Set a new timer for 10 minutes (600000 ms)
  idleTimeout = setTimeout(() => {
    if (authStore.userDetails) {  // Only log out if the user is logged in
      authStore.logOut();  // Trigger the logout action from the store
      // Redirect to the login page after logout
      router.push({ path: '/login', query: { message: 'Your previous session has expired,You are Logged out to keep your data secure.' } });
     
    }
  }, 600000);  // 10-minute inactivity timer
};

// Function to set up idle timer and event listeners
const setupIdleTimer = () => {
  window.addEventListener('mousemove', resetIdleTimer);
  window.addEventListener('keydown', resetIdleTimer);
  window.addEventListener('click', resetIdleTimer);
  window.addEventListener('scroll', resetIdleTimer);

  resetIdleTimer();  // Initialize the idle timer
};

// Clean up the event listeners and timers
const removeIdleTimer = () => {
  clearTimeout(idleTimeout);  // Clear the timer
  window.removeEventListener('mousemove', resetIdleTimer);
  window.removeEventListener('keydown', resetIdleTimer);
  window.removeEventListener('click', resetIdleTimer);
  window.removeEventListener('scroll', resetIdleTimer);
};

// Watch for changes in user authentication status
watch(
  () => authStore.userDetails,  // Watch the userDetails object in authStore
  (newVal) => {
    if (newVal) {
      // If user is logged in, start the idle timer
      setupIdleTimer();
    } else {
      // If user logs out, remove the idle timer
      removeIdleTimer();
    }
  }
);

// Optionally use onMounted for initial logic
onMounted(() => {
  // If the user is already logged in when the component mounts, set up the idle timer
  if (authStore.userDetails) {
    setupIdleTimer();
  }
});

// Clean up on component unmount (good practice)
onUnmounted(() => {
  removeIdleTimer();
});
</script>

<template>
  <RouterView :is-warning-visible="isWarningVisible" :warning-countdown="warningCountdown"/>
</template>

<style scoped>
</style>