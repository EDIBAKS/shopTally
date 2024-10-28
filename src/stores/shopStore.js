import { defineStore } from 'pinia';
import { ref, onMounted, watch } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuthStore } from './authStore';

export const useShopStore = defineStore('shopStore', () => {
  const authStore = useAuthStore();
  const departmentProducts = ref([]);
  const mainStock=ref([])
  const error = ref(null);
  const isLoading = ref(false);
  const shops = ref([]);
  
  const fetchProductDetails = async (productCodes) => {
    const products = [];
  
    // Check if the productCodes array is empty
    if (!productCodes.length) {
      console.warn('Product codes array is empty. No products to fetch.');
      return products; // Return an empty array if no product codes are provided
    }
  
    try {
      const q = query(
        collection(db, 'products'), // Assuming you have a 'products' collection
        where('productCode', 'in', productCodes) // Match all productCodes in the department's products
      );
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          productCode: data.productCode,
          productName: data.productName // Fetch productName
        });
      });
    } catch (err) {
      console.error('Error fetching product details:', err);
    }
  
    return products;
  };
  

  //const fetchDepartmentProducts = async () => {
    //if (!authStore.userDetails) {
    //  error.value = 'User not logged in';
    //  return;
   // }

   // const userDepartment = authStore.userDetails.department;
//
   // try {
    //  isLoading.value = true;
    //  error.value = null;

     // const q = query(
     //   collection(db, 'departments'),
     //   where('departmentName', '==', userDepartment)
    //  );

     // const querySnapshot = await getDocs(q);

     // const productCodes = [];

    //  querySnapshot.forEach((doc) => {
      //  const data = doc.data();
      //  if (data.DispatchedProducts && Array.isArray(data.DispatchedProducts)) {
       //   data.DispatchedProducts.forEach((product) => {
       //    productCodes.push(product.productCode);
       //   });
      //  }
     // });

    //  const productDetails = await fetchProductDetails(productCodes);
    //  departmentProducts.value = productDetails;
   // } catch (err) {
    //  error.value = `Error fetching department products: ${err.message}`;
   // } finally {
  //    isLoading.value = false;
  //  }
 // };

 const fetchDepartmentProducts = async () => {
    if (!authStore.userDetails) {
      error.value = 'User not logged in';
      return;
    }
  
    const userDepartment = authStore.userDetails.departmentName;
  
    try {
      isLoading.value = true;
      error.value = null;
  
      // Query to fetch the department's products
      const q = query(
        collection(db, 'departments'),
        where('departmentName', '==', userDepartment)
      );
  
      const querySnapshot = await getDocs(q);
  
      const dispatchedProducts = [];
  
      // Extract the productCode and dispatchedAmount from DispatchedProducts[]
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.DispatchedProducts && Array.isArray(data.DispatchedProducts)) {
          data.DispatchedProducts.forEach((product) => {
            dispatchedProducts.push({
              productCode: product.productCode,
              dispatchedAmount: product.dispatchedAmount, // Include dispatchedAmount
            });
          });
        }
      });
  
      // Fetch product details based on the product codes
      const productCodes = dispatchedProducts.map((product) => product.productCode);
      const productDetails = await fetchProductDetails(productCodes);
  
      // Map dispatchedAmount to the fetched product details
      departmentProducts.value = productDetails.map((product) => {
        const dispatchedProduct = dispatchedProducts.find(
          (dp) => dp.productCode === product.productCode
        );
        return {
          ...product,
          dispatchedAmount: dispatchedProduct ? dispatchedProduct.dispatchedAmount : 0,
        };
      });
  
    } catch (err) {
      error.value = `Error fetching department products: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };





  const fetchMainStore = async () => {
    if (!authStore.userDetails) {
      error.value = 'User not logged in';
      return;
    }
  try {
      //isLoading.value = true;
      error.value = null;
    const querySnapshot = await getDocs(collection(db, "productStock"));
    mainStock.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log('the stock',availableStock.value)
  }catch (err) {
    error.value = `Error fetching product stock: ${err.message}`;
  } 

  }



  // New function to fetch shops based on the user's selection
  const fetchShops = async (fetchAll = false) => {
    try {
      isLoading.value = true;
      error.value = null;

      let q;

      if (fetchAll) {
        // Fetch all shops
        q = query(collection(db, 'SHOPS'));
      } else {
        // Fetch only shops belonging to the current user's department
        const userDepartment = authStore.userDetails.departmentName;
        q = query(
          collection(db, 'SHOPS'),
          where('department', '==', userDepartment)
        );
      }

      const querySnapshot = await getDocs(q);
      const fetchedShops = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedShops.push({
          shopCode: data.shopCode,
          shopName: data.shopName,
        });
      });

      shops.value = fetchedShops;
    } catch (err) {
      error.value = `Error fetching shops: ${err.message}`;
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch department products when the component is mounted
  onMounted(() => {
    if (authStore.userDetails) {
      fetchDepartmentProducts();
      fetchShops(); // Default fetch shops for the current department
      fetchMainStore();
    }
  });

  // Watch for changes in the user details and re-fetch department products and shops
  watch(
    () => authStore.userDetails,
    (newUserDetails) => {
      if (newUserDetails) {
        fetchDepartmentProducts();
        fetchShops(); // Re-fetch shops for the new department
      }
    }
  );

  return {
    departmentProducts,
    mainStock,
    fetchDepartmentProducts,
    fetchShops,
    fetchMainStore,
    shops,
    isLoading,
    error
  };
});
