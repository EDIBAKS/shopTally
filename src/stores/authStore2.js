import { defineStore } from 'pinia';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const userDetails = ref({});
  const initialized = ref(false);
  let idleTimeout = null;

  const initializeAuth = async () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          console.log('User is logged in:', currentUser);
          user.value = currentUser;
          await fetchUserDetails(currentUser.uid);
          startIdleTimer();  // Start idle timer on user login
        } else {
          console.log('No user is logged in');
          user.value = null;
          userDetails.value = {};
          clearIdleTimer();  // Clear idle timer on user logout
        }
        initialized.value = true;
        resolve();
      });
    });
  };

  const startIdleTimer = () => {
    // Reset any existing timer
    clearIdleTimer();

    // Start a new timer for 10 minutes (600,000 ms)
    idleTimeout = setTimeout(() => {
      signOutUser();
    }, 600000);
  };

  const clearIdleTimer = () => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
  };

  const resetIdleTimer = () => {
    startIdleTimer();
  };

  const registerActivityListeners = () => {
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keypress', resetIdleTimer);
  };

  const unregisterActivityListeners = () => {
    document.removeEventListener('mousemove', resetIdleTimer);
    document.removeEventListener('keypress', resetIdleTimer);
  };

  onMounted(() => {
    registerActivityListeners();
  });

  onBeforeUnmount(() => {
    unregisterActivityListeners();
  });

  const verifyPassword = async (currentPassword) => {
    const userCredential = EmailAuthProvider.credential(user.value.email, currentPassword);
    try {
      await reauthenticateWithCredential(user.value, userCredential);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (email, password, additionalDetails) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const userDetailsWithId = { ...additionalDetails, uid: newUser.uid };
      await setDoc(doc(db, 'userDetails', newUser.uid), userDetailsWithId);
      user.value = newUser;
      userDetails.value = userDetailsWithId;
      router.push('/profile');
      startIdleTimer();  // Start idle timer on successful registration
    } catch (error) {
      console.error('Error registering user:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      await fetchUserDetails(user.value.uid);
      router.push('/profile');
      startIdleTimer();  // Start idle timer on successful sign-in
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      user.value = null;
      userDetails.value = {};
      router.push('/');
      clearIdleTimer();  // Clear idle timer on sign-out
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const fetchUserDetails = async (uid) => {
    try {
      console.log('Fetching user details for UID:', uid);
      const docRef = doc(db, 'userDetails', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log('Fetched user details:', docSnap.data());
        userDetails.value = docSnap.data();
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const updateUserDetails = async (updatedDetails) => {
    if (!user.value || !user.value.uid) {
      throw new Error('User not authenticated');
    }
    try {
      const userRef = doc(db, 'userDetails', user.value.uid);
      await updateDoc(userRef, updatedDetails);
      userDetails.value = { ...userDetails.value, ...updatedDetails };
    } catch (error) {
      console.error('Error updating user details:', error);
    }
  };

  const reauthenticate = async (currentPassword) => {
    if (!user.value) throw new Error('User not authenticated');
    const userCredential = EmailAuthProvider.credential(user.value.email, currentPassword);
    try {
      await reauthenticateWithCredential(user.value, userCredential);
    } catch (error) {
      throw new Error('Current password is incorrect');
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await reauthenticate(currentPassword);
      await user.value.updatePassword(newPassword);
    } catch (error) {
      console.error('Error changing password:', error);
      throw new Error('Error changing password');
    }
  };

  return { user, userDetails, initialized, initializeAuth, register, signIn, signOutUser, fetchUserDetails, updateUserDetails, verifyPassword, changePassword };
});
