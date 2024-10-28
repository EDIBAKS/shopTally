import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firebase db instance
import { useAuthStore } from './authStore'; // Auth store to get user details

export const useReportStore = defineStore('ReportStore', () => {
  const authStore = useAuthStore(); // Access the authStore to get user details
  const departments = ref([]);
  const dispatchedProducts = ref([]);
  const shopDispatches = ref([]); // Reactive state for shop dispatches
  const selectedDepartmentCode = ref(authStore.userDetails.departmentCode); // Automatically set based on the logged-in user's department
  const selectedShopCode = ref(''); // User-selected shop code

  // Action to fetch departments based on selected departmentCode
  const fetchDepartments = async () => {
    try {
      const departmentQuery = query(
        collection(db, 'departments'),
        where('departmentCode', '==', selectedDepartmentCode.value)
      );
      const departmentSnapshot = await getDocs(departmentQuery);
      departments.value = departmentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  // Action to fetch dispatched products for the selected department
  const fetchDispatchedProducts = async () => {
    try {
      const dispatchQuery = query(
        collection(db, 'dispatches'),
        where('departmentCode', '==', selectedDepartmentCode.value)
      );
      const dispatchSnapshot = await getDocs(dispatchQuery);
      dispatchedProducts.value = dispatchSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching dispatched products:', error);
    }
  };
 // Fetch dispatched products for a selected shop
 const fetchShopSupplyData = async (shopCode) => {
  try {
    shopDispatches.value = []; // Clear previous data
    const shopSupplyQuery = query(
      collection(db, 'shopSupply'),
      where('shopCode', '==', shopCode)
    );
    const shopSupplySnapshot = await getDocs(shopSupplyQuery);

    if (!shopSupplySnapshot.empty) {
      shopDispatches.value = shopSupplySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          shopCode: data.shopCode,
          shopName: data.shopName,
          DispatchedProducts: data.DispatchedProducts.map(product => ({
            productCode: product.productCode,
            dispatchedAmount: product.dispatchedAmount,
          })),
        };
      });
    } else {
      console.log('No data found for the selected shop');
    }
  } catch (error) {
    console.error('Error fetching shop supply data:', error);
  }
};

  // Computed property to get filtered departments
  const filteredDepartments = computed(() => {
    return departments.value.filter(dept => dept.departmentCode === selectedDepartmentCode.value);
  });

  // Action to set the selected shop code
  const setShopCode = (shopCode) => {
    selectedShopCode.value = shopCode;
  };

  return {
    // State
    departments,
    dispatchedProducts,
    shopDispatches,
    selectedDepartmentCode,
    selectedShopCode,

    // Actions
    fetchDepartments,
    fetchDispatchedProducts,
    fetchShopSupplyData,
    setShopCode,

    // Computed
    filteredDepartments,
  };
});
