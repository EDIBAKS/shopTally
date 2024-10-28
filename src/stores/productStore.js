import { defineStore } from 'pinia';
import { ref, onMounted,watch } from 'vue';
import { collection, getDocs,query,where } from 'firebase/firestore';
import { db } from '../firebase'; // make sure you have Firebase initialized
import { useAuthStore } from './authStore'; // Import your authStore

export const useProductStore = defineStore('productStore', () => {
  const products = ref([]);
  const shops = ref([]);
  const selectedShop = ref(""); // Bind this to the select input
const availableStock= ref([])
  const authStore = useAuthStore(); // Access the authStore
  const department = ref(null);     // Local ref for department in productStore
const fetchedDeps=ref([])
  // Fetch products from Firestore
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    products.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const fetchdepartments = async () => {
    const querySnapshot = await getDocs(collection(db, "departments"));
    fetchedDeps.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  const fetchStock = async () => {
    const querySnapshot = await getDocs(collection(db, "productStock"));
    availableStock.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('the stock',availableStock.value)
  };


   // Fetch shops based on the department of the logged-in user
  const fetchShops = async () => {
    if (!department.value) return; // Early return if department is not set

    const q = query(collection(db, 'SHOPS'), where('department', '==', department.value));
    const querySnapshot = await getDocs(q);
    shops.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      shopCode: doc.data().shopCode,
      shopName: doc.data().shopName,
    }));
  };


  

  // Watch for changes in authStore's userDetails to get the department
  watch(
    () => authStore.userDetails,
    (newDetails) => {
      if (newDetails && newDetails.department) {
        department.value = newDetails.department;
        fetchShops();  // Fetch shops once the department is available
      }
    },
    { immediate: true } // Run this watcher immediately on component mount
  );

  onMounted(async () => {
    await fetchProducts(); // Fetch products when the component is mounted
    await fetchShops();    // Fetch shops
    //await fetchdepartments();//fetch all the available departments
   // Call fetchStock to load the data
    await fetchStock();
  });

  return {
    products,
    shops,
    selectedShop,
    fetchedDeps,
    availableStock,
     // Return the selected shop
    fetchProducts,
    fetchShops,
    fetchdepartments,
    fetchStock

  };
});