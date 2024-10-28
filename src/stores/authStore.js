import { defineStore } from 'pinia';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { ref, onMounted,onBeforeUnmount } from 'vue';
import Toastify from 'toastify-js'; 
import 'toastify-js/src/toastify.css';

export const useAuthStore = defineStore('authStore', () => {
  const router = useRouter();
  const userDetails = ref(null);
  const userUid = ref(null);
  const isDivVisible = ref(false);
  const isLoading = ref(false);  // Add a loading state
  //const inactivityTimer = ref(null);  // Timer for inactivity
//const logoutTimeLimit = 120000; // 2 minutes (in milliseconds)
  // Toggle div visibility function
  const toggleDivVisibility = () => {
    isDivVisible.value = !isDivVisible.value;
  };
  const storeUserInLocalStorage = (userDetails, uid) => {
    localStorage.setItem('userDetails', JSON.stringify({ ...userDetails, uid }));
  };
  
  const loadUserFromLocalStorage = () => {
    const storedUser = localStorage.getItem('userDetails');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  };



  



  // Retrieve user details from local storage
  const getUserFromLocalStorage = () => {
    const storedDetails = localStorage.getItem('userDetails');
    const storedUid = localStorage.getItem('userUid');
    if (storedDetails && storedUid) {
      userDetails.value = JSON.parse(storedDetails);
      userUid.value = storedUid;
    }
  };


// Add this function to your existing authStore
const initializeAuth = async () => {
  try {
    // Check if user is already authenticated (from Firebase Auth)
    const currentUser = auth.currentUser;
    if (currentUser) {
      // If a user is found, fetch their details
      await fetchUserDetails();
    } else {
      // If no user is found, load from localStorage if available
      getUserFromLocalStorage();
    }
  } catch (error) {
    console.error("Error during authentication initialization:", error);
  }
};

  // Call this function on component mount to load user details
  onMounted(() => {
    getUserFromLocalStorage();
    initializeAuth(); 
  
    
  });

  onBeforeUnmount(() => {
    clearTimeout(inactivityTimer.value);
    removeInactivityEventListeners();
  });

  // Function to sign up a user and store additional details in Firestore
  const signUp = async (email, password, additionalDetails) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      const userDoc = doc(db, 'users', user.uid);
      await setDoc(userDoc, {
        uid: user.uid,
        ...additionalDetails,
        role: additionalDetails.role || 'user',
        createdAt: new Date()
      });

      storeUserInLocalStorage(additionalDetails, user.uid);
      userDetails.value = additionalDetails;
      userUid.value = user.uid;

      // Redirect based on role
      routeToProfile(additionalDetails.role);
      showToast('New user successfully created', 'green');
    } catch (error) {
      console.error('Error during sign-up:', error);
      showToast('Failed to create new user', 'red');
    }
  };

  const routeToProfile = (role) => {
    switch (role) {
      case 'Admin':
        router.push('/admin-panel'); // Redirect to admin panel
        break;
      case 'Attendant':
        router.push('/user-panel'); // Redirect to sales dashboard
        break;
      case 'Shop':
        router.push('/shop-panel'); // Redirect to manager dashboard
        break;
      default:
        router.push('/'); // Default route for regular users
        break;
    }
  };
  



  const logIn= async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
  
      // Fetch user details, including the role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userDetails.value = userData;
        userUid.value = user.uid;
  
        // Store user details in local storage for later use
        storeUserInLocalStorage(userData, user.uid);
  
        // Route based on role
        routeToProfile(userData.role);  // Now using 'role' to guide routing
        showToast('Connexion réussie', 'green');
      } else {
        console.error('User document does not exist');
        showToast('Échec du connexion','red');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      showToast('Failed to sign in', 'red');
    }
  };
  

  // Function to log out the user
  const logOut = async () => {
    try {
      await signOut(auth);

      // Clear user data from store and local storage
      userDetails.value = null;
      userUid.value = null;
      localStorage.removeItem('userDetails');
      localStorage.removeItem('userUid');

      showToast('Déconnecté', 'gray');
      router.push({ path: '/login' });
    } catch (error) {
      console.error('Error during sign out:', error);
      showToast('Sign out failed', 'red');
    }
  };

  // Handle auth state changes
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // User is logged in, fetch details from Firestore or LocalStorage
      getUserFromLocalStorage();
      await fetchUserDetails();
    } else {
      // Clear user data if logged out
      userDetails.value = null;
      userUid.value = null;
      localStorage.removeItem('userDetails');
      localStorage.removeItem('userUid');
    }
  });

 // Fetch user details when the user is already logged in
const fetchUserDetails = async () => {
  isLoading.value = true;  // Start loading

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDoc = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userDoc);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        userDetails.value = userData;
        userUid.value = currentUser.uid;

        // Store in localStorage
        storeUserInLocalStorage(userData, currentUser.uid);
      }
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  } finally {
    isLoading.value = false;  // End loading after fetching data
  }
};
  



  

  // Function to show toast notifications
  const showToast = (message, color) => {
    Toastify({
      text: message,
      duration: 5000,
      close: true,
      gravity: 'top',
      position: 'right',
      backgroundColor: color,
    }).showToast();
  };

  return {
    signUp,
    logIn,
    logOut,
    userDetails,
    userUid,
    isDivVisible,
    toggleDivVisibility,
    fetchUserDetails,
    initializeAuth,
   
  };
});
