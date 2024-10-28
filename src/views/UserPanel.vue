<template>
  <div class="user-panel">
    <!-- Header Section -->
    <header class="header flex justify-between items-center p-4 bg-gray-200">
  <!-- User Details on the left -->
  <div class="flex items-center">
  <div class="flex flex-col leading-none">
    <small class="text-gray-500">{{ currentDateTime }} <span class="text-blue-800 text-bold">{{ userDetails.departmentName }}</span></small>
    <p class="text-lg font-bold text-gray-500 inline">
      {{ userDetails.firstname }} <span>{{ userDetails.lastname }}</span>
  </p>
   
  </div>
</div>

  <!-- Buttons and Department Details on the right -->
  <div class="actions flex items-center gap-6">
    <!-- Department Details -->
    <div class="flex flex-col leading-none">
      <small class="text-gray-500">{{ userDepartCode }}</small>
      <p class=" font-bold text-gray-700">{{ userDepartment }}</p>
    </div>

    <!-- Dispatch Button -->
    <button @click="openDispatchPopup" class="btn bg-blue-500 text-white px-3 py-1.5 text-sm rounded">
      Dispatch to Shops
    </button>

    <!-- Log Out Button -->
    <button @click="handleLogout" class="btn bg-red-500 text-white px-3 py-1.5 text-sm rounded">
      Log Out
    </button>
  </div>
</header>


    <shopSupply
:dialogVisibility="dialog" 
   @close="handleClose"
/>
    <!-- Report Filters -->
    <div class="report-filters p-4 bg-gray-100 flex gap-4">
      <select v-model="selectedReportType" class="p-2 border rounded">
        <option value="" disabled>Report Type</option>
        <option value="dispatches">Dispatches</option>
        <option value="daily-tally">Shop Tally</option>
        <option value="stock-report">Shop Stock</option>
        <option value="sales-report">Shop Sales</option>
        <option value="summary-stock">Summary Stock</option>
        <option value="summary-sales">Summary Sales</option>
      </select>

      <label for="shopSelect">Select Shop:</label>
    <select v-model="selectedShopCode" :disabled="isShopCodeDisabled" id="shopSelect">
      <option disabled value="">Please select a shop</option>
      <option v-for="shop in shopStore.shops" :key="shop.shopCode" :value="shop.shopCode">
        {{ shop.shopName }}
      </option>
    </select>
      

      <input type="date" v-model="startDate" :disabled="isDateDisabled"  class="p-2 border rounded" />
      <input type="date" v-model="endDate" :disabled="isDateDisabled"  class="p-2 border rounded" />

      <button @click="generateReport" class="btn bg-green-500 text-white px-4 py-2 rounded">
        Generate Report
      </button>
    </div>

    <!-- Reports Container -->
    <!-- -->
    <div class="report-container p-4">
      <div class="flex items-center justify-between">
  <h2 class="text-xl font-bold">Report: {{ selectedReportType }}</h2>
  <div class="text-blue-800 text-sm text-bold">
    <span>From: {{ startDate }}</span>
    <span class="ml-2">To: {{ endDate }}</span>
  </div>
</div>

  <div v-if="noDataMessage">{{ noDataMessage }}</div>
  <!-- Report: Shop Supply Report -->
  <div v-if="selectedReportType === 'sales-report'" class="relative overflow-x-auto">
    <h8>Generate Shop Supply Report</h8>
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-2 py-3">
                    Product name
                </th>
                <th v-for="(month, index) in months" :key="index" scope="col" class="px-2 py-3">
                  {{month}}
                </th>
               
            </tr>
        </thead>
        <tbody>
            <tr v-for="product in salesData" :key="product.productCode" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" class="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ product.productName }}
                </th>
                <td v-for="(quantity, monthIndex) in product.quantities" :key="monthIndex" class="px-6 py-4">
                  {{ quantity }}
                </td>
               
            </tr>
            </tbody>
            </table>

  </div>

  <!-- Report: Sales Report -->
  <div v-if="selectedReportType === 'stock-report'" class="relative overflow-x-auto">
    <div>
  

    <!-- Display fetched dispatched products -->
    <div v-if="dispatchedProducts.length">
     <div class="text-gray-600 text-bold">Shop:{{selectedShopCode}}</div>
      <ul class="space-y-2 bg-white rounded-lg shadow-md p-4">
  <li v-for="product in dispatchedProducts" :key="product.productCode" class="flex justify-between items-center p-3 border-b border-gray-200 last:border-none">
    <div class="text-sm font-medium text-gray-900 w-32">
       <!-- Call the function to fetch productName for each productCode -->
       {{product.productCode}}
    </div>
    <div class="text-sm font-medium text-gray-900 flex-1">
       <!-- Call the function to fetch productName for each productCode -->
       {{product.productName}}
    </div>
    <div class="text-sm text-gray-600">
      Amt: <span class="text-green-600 font-semibold">{{ product.dispatchedAmount }}</span>
    </div>
  </li>
</ul>
    </div>
  </div>
  </div>
  <div v-if="selectedReportType==='daily-tally'">
     <!-- Daily Sales Summary List -->
     <ul class="mt-6 space-y-4">
        <li v-for="(receipt, index) in salesTally" :key="index" class="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-lg">Receipt No: {{ receipt.receiptNo }}</span>
            <span class="text-sm text-gray-500">
               {{ formatTimestamp(receipt.dateEntered) }}
               </span>
          </div>
          <ul class="ml-4 space-y-2">
            <li v-for="(product, pIndex) in receipt.products" :key="pIndex" class="flex justify-between">
              <span class="text-gray-700"><span class="mr-2 text-blue-900 text-bold">{{product.quantity}}</span>{{ product.productName }} <q-badge outline color="orange" :label="`${product.distributorPrice}`"/></span> 
              <span class="font-medium text-gray-800">${{ (product.total || 0).toFixed(2) }}</span>
            </li>
          </ul>
          <div class="font-bold mt-2 text-xl">
            Total: ${{ calculateReceiptTotal(receipt.products).toFixed(2) }}
            <span class="block text-sm text-gray-600"> Total in Local Currency: {{ (calculateReceiptTotal(receipt.products) * 600).toFixed(0) }}</span>
           
          </div>
          <button
        @click="updateShopSupplyAndDeleteSalesTally(receipt.id)"
        class="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Delete Receipt
      </button>
        </li>
      </ul>

  </div>
  <div v-if="selectedReportType==='dispatches'">
    <div v-if="dispatched.length">
   
 <!-- Daily Sales Summary List -->
 <ul >
         <li  >
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-500">
            
              <small class="text-blue-600 text-bold"></small>
               </span>
               <span class="text-sm text-gray-500"></span>
          </div>
        
        
        </li>
        <div  class="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
    <q-list class="mt-6 space-y-4" v-for="(dispatch, index) in dispatched" :key="index" bordered separator>
      
    <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>{{ formatTimestamp(dispatch.date) }} <span class="text-blue-600 ">{{ dispatch.shopName }}</span> </q-item-label>
          <q-item-label class="text-bold">{{ dispatch.productName }}</q-item-label>
          <q-item-label caption></q-item-label>
        </q-item-section>
        
        <div class="flex items-center gap-4">
  <!-- Dispatched Amount styled in blue-600 -->
  <div class="text-blue-600">{{ dispatch.dispatchedAmount }} PCS</div>
  
  <!-- RETURN Button -->
  <div>
    <q-btn 
      flat 
      style="color: red" 
      label="CANCEL" 
      icon="delete"
      @click="handleReturn(dispatch.productCode, dispatch.dispatchedAmount, dispatch.shopCode, dispatch.docId)" 
    />
  </div>
</div>
       
      </q-item>
      </q-list>
      </div>
      </ul>


    </div>
  </div>
  <div v-if="selectedReportType==='summary-stock'">
    <table class="dispatched-products-table">
  <thead>
    <tr>
     
    </tr>
  </thead>
  <tbody>
    <tr v-for="product in dispatchedProductsData" :key="product.productCode">
      <td>{{ product.productCode }}</td>
      <td v-for="shop in shopList" :key="shop">{{ product[shop] }}</td>
    </tr>
  </tbody>
</table>


<div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Product name
                </th>
                <th v-for="shop in shopList" :key="shop" scope="col" class="px-6 py-3">
                  {{ shop.shopName }}
                </th>
                
            </tr>
        </thead>
        <tbody>
            <tr  v-for="product in dispatchedProductsData" :key="product.productCode" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th  scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ product.productName }}
                </th>
                <td v-for="shop in shopList" :key="shop"  class="px-6 py-4">
                  {{ product[shop.shopName] || 0 }}
                </td>
              
            </tr>
            </tbody>
            </table>
            </div>

  </div>
  <div v-if="selectedReportType==='summary-sales'">
  

    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Product name
                </th>
                <th  v-for="shop in depShops" :key="shop.shopCode" scope="col" class="px-6 py-3">
                  {{ shop.shopName }}
                </th>
                
            </tr>
        </thead>
        <tbody>
            <tr v-for="product in soldProducts" :key="product.productCode" class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ product.productName }}
                </th>
                <td v-for="shop in depShops" :key="shop.shopCode" class="px-6 py-4">
                  {{ product.quantities[shop.shopCode] || 0 }}
                </td>
               
            </tr>
            </tbody>
            </table>
            </div>
  </div>
  <!-- Add more report types here -->
</div>

      
    </div>
  
</template>

<script setup>
import { ref,onMounted,computed, defineProps,watchEffect,watch } from 'vue';
import { 
  query, 
  collection, 
  where, 
  getDocs, 
  updateDoc, 
  getDoc, 
  deleteDoc, 
  doc,
  Timestamp 
} from 'firebase/firestore'; // Ensure doc is imported
import {db} from '../firebase'

import shopSupply from '../components/shopSupply.vue';
//import {reportService} from '../services/reportService'
import { useShopStore } from '../stores/shopStore'
const shopStore = useShopStore();
import { useReportStore } from '../stores/ReportStore';
//const reportStore = useReportStore();
const dialog=ref(false)
import Toastify from 'toastify-js'; 
import 'toastify-js/src/toastify.css';
// Report type, date inputs, and report data
const selectedReportType = ref('dispatches');
const selectedShopCode = ref('RCD');
const dispatchedProducts = ref([]);
const today = new Date();
const reportData = ref(null);
const shopTallyData = ref([]);
const shopSupplyData = ref([]);
const salesData = ref([]);
const startDate = ref(null); // user selected startDate
const endDate = ref(null); // user selected endDate
const salesTally = ref([]); // to store the fetched products
const dispatched = ref([]);
const dispatchedProductsData = ref([]);
const productList = ref([]);  // List of products as rows
const shopList = ref([]);     // List of shops as columns
const soldProducts = ref([]);
const depShops = ref([]);
const productTally = ref([]);
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const noDataMessage = ref('');

const props = defineProps({
  isWarningVisible: Boolean,
  warningCountdown: Number,
});

import { useAuthStore } from '../stores/authStore' // Assuming you have the authStore
const authStore = useAuthStore()
// User details from the store (or API)
//const user = computed(() => authStore.user);
const userDetails = computed(() => authStore.userDetails);
const currentDateTime = ref('');
 // Function to get the current date and time
 const updateDateTime = () => {
  const now = new Date();
  const formattedDateTime = now.toLocaleString(); // Format as per your preference
  currentDateTime.value = formattedDateTime;
};
//anual sales per product per month
const fetchSales = async (selectedShopCode) => {
  // Use the selected shopCode
  const shopCode = selectedShopCode || useAuthStore().userDetails?.shopCode;

  if (!shopCode) {
    console.error('No shopCode available for the current user.');
    return [];
  }

  try {
    // Fetch the entire year range
    const startOfYear = new Date(new Date().getFullYear(), 0, 1); // January 1st of the current year
    const endOfYear = new Date(new Date().getFullYear(), 11, 31, 23, 59, 59, 999); // December 31st of the current year

    const startTimestamp = Timestamp.fromDate(startOfYear);
    const endTimestamp = Timestamp.fromDate(endOfYear);

    // Query sales data for the selected shopCode within the year
    const q = query(
      collection(db, 'salesTally'),
      where('shopCode', '==', shopCode),
      where('dateEntered', '>=', startTimestamp),
      where('dateEntered', '<=', endTimestamp)
    );

    const querySnapshot = await getDocs(q);

    // Initialize product tally for each month (12 months)
    const productMonthlyTally = {};

    // Iterate through the fetched sales data
    for (const doc of querySnapshot.docs) {
      const salesData = doc.data();
      const products = salesData.products || [];
      const dateEntered = salesData.dateEntered.toDate();
      const month = dateEntered.getMonth(); // Get the month index (0 for January, 11 for December)

      // Aggregate the product quantity per month
      for (const product of products) {
        const { productCode, productName, quantity } = product;

        // Initialize the productCode if not already present
        if (!productMonthlyTally[productCode]) {
          productMonthlyTally[productCode] = {
            productName: productName || 'Unknown Product', // Store productName as well
            quantities: Array(12).fill(0), // Array of 12 months, filled with 0
          };
        }

        // Add the quantity sold in the correct month
        productMonthlyTally[productCode].quantities[month] += quantity;
      }
    }

    // Convert the product tally to an array for display
    const productTallyArray = Object.keys(productMonthlyTally).map((productCode) => {
      return {
        productCode,
        productName: productMonthlyTally[productCode].productName, // Include productName in the return object
        quantities: productMonthlyTally[productCode].quantities,   // Array of quantities for each month
      };
    });

    // Return the tally for rendering in the table
    return productTallyArray;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return [];
  }
};
// Method to calculate the receipt total
function calculateReceiptTotal(products) {
  return products.reduce((acc, product) => acc + (product.total || 0), 0);
}
// Function to fetch product names for each dispatched product
const fetchProductNames = async () => {
  try {
    const updatedProducts = await Promise.all(
      dispatchedProducts.value.map(async (product) => {
        const productRef = collection(db, 'products');
        const productQuery = query(productRef, where('productCode', '==', product.productCode));
        const productSnapshot = await getDocs(productQuery);

        if (!productSnapshot.empty) {
          const productDoc = productSnapshot.docs[0]; // Assuming productCode is unique
          const productData = productDoc.data();
          return {
            ...product,
            productName: productData.productName || 'Unknown Product', // Fallback if productName is missing
          };
        } else {
          return {
            ...product,
            productName: 'Unknown Product', // Fallback if no product is found
          };
        }
      })
    );

    dispatchedProducts.value = updatedProducts; // Update with product names
  } catch (error) {
    console.error('Error fetching product names:', error);
  }
};
// Call the fetchProductNames function after fetching dispatched products
const fetchDispatchedProducts = async () => {
  if (!selectedShopCode.value) {
    console.warn('No shop code selected');
    noDataMessage.value = 'Please select a shop to view the report.';
    return;
  }

  try {
    // Query shopSupply collection where shopCode matches the selectedShopCode
    const q = query(collection(db, 'shopSupply'), where('shopCode', '==', selectedShopCode.value));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      noDataMessage.value = 'No dispatched products found for the selected shop.';
      dispatchedProducts.value = [];
      return;
    }

    // Assume there is one document per shopCode
    const shopSupplyDoc = querySnapshot.docs[0];
    const shopSupplyData = shopSupplyDoc.data();
    dispatchedProducts.value = shopSupplyData.DispatchedProducts || [];
    noDataMessage.value = ''; // Clear the message if data is found

    // Fetch product names
    await fetchProductNames();
  } catch (error) {
    console.error('Error fetching dispatched products:', error);
    noDataMessage.value = 'An error occurred while fetching the report.';
  }
};
const fetchDispatches1 = async () => {
  if (selectedShopCode.value && startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value));

    try {
      const supplyLogRef = collection(db, 'shopLogs');
      const q = query(
        supplyLogRef,
        where('shopCode', '==', selectedShopCode.value),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp)
      );
  // Clear the existing data before adding new dispatches
             dispatched.value = [];
      const querySnapshot = await getDocs(q);
      const dispatchedProducts = querySnapshot.docs.flatMap(doc => {
        const data = doc.data();
        return data.dispatchedProducts.map(product => ({
          dispatchedAmount: product.dispatchedAmount,
          productCode: product.productCode,
        }));
      });

      const productDetailsPromises = dispatchedProducts.map(async (product) => {
        const productQuery = query(collection(db, 'products'), where('productCode', '==', product.productCode));
        const productSnapshot = await getDocs(productQuery);

        if (!productSnapshot.empty) {
          const productDoc = productSnapshot.docs[0]; 
          const productData = productDoc.data();
          return {
            ...product,
            productName: productData.productName,
            distributorPrice: productData.distributorPrice,
            bonusValue: productData.bonusValue,
          };
        } else {
          return product;
        }
      });

      const dispatchedWithDetails = await Promise.all(productDetailsPromises);

      dispatched.value = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          docId: doc.id, // Include document ID here
          date: data.date, 
          shopCode: data.shopCode,
          shopName: data.shopName,
          departmentCode: data.departmentCode,
          departmentName: data.departmentName,
          dispatchedProducts: dispatchedWithDetails,
        };
      });

      console.log(dispatched.value);
    } catch (error) {
      console.error("Error fetching dispatched products:", error);
    }
  }
};

const fetchDispatches = async () => {
  if (selectedShopCode.value && startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value));

    try {
      const supplyLogRef = collection(db, 'shopLogs');
      const q = query(
        supplyLogRef,
        where('shopCode', '==', selectedShopCode.value), // Filter by shopCode
        where('date', '>=', startTimestamp),             // Filter by date range
        where('date', '<=', endTimestamp)
      );
      
      // Clear the existing data before adding new dispatches
      dispatched.value = [];
      
      const querySnapshot = await getDocs(q);

      // Map through each document and get its data
      const dispatchPromises = querySnapshot.docs.map(async (doc) => {
        const data = doc.data();  // Fetch all fields from the document

        // Fetch product details for the productCode
        const productQuery = query(collection(db, 'products'), where('productCode', '==', data.productCode));
        const productSnapshot = await getDocs(productQuery);

        let productDetails = {};
        if (!productSnapshot.empty) {
          const productDoc = productSnapshot.docs[0]; 
          const productData = productDoc.data();
          productDetails = {
            productName: productData.productName,
            distributorPrice: productData.distributorPrice,
            bonusValue: productData.bonusValue
          };
        }

        // Return the document data along with the fetched product details
        return {
          docId: doc.id,         // Include document ID
          ...data,               // Spread to include all fields from shopLogs (date, shopCode, etc.)
          ...productDetails      // Include product details (productName, distributorPrice, etc.)
        };
      });

      // Wait for all product details to be fetched and then set dispatched
      dispatched.value = await Promise.all(dispatchPromises);

      console.log(dispatched.value);
    } catch (error) {
      console.error("Error fetching dispatched products:", error);
    }
  }
};
// Set the default range to the current month
const setDefaultMonth = () => {
  startDate.value = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substr(0, 10);
  endDate.value = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().substr(0, 10);
};

//fetch daily tally per shop
const fetchSalesTally = async () => {
  if (selectedShopCode.value && startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value));

    const salesQuery = query(
      collection(db, 'salesTally'),
      where('shopCode', '==', selectedShopCode.value),
      where('dateEntered', '>=', startTimestamp),
      where('dateEntered', '<=', endTimestamp)
    );

    try {
      const querySnapshot = await getDocs(salesQuery);
      const sales = [];

      // Loop through each salesTally document
      for (const doc of querySnapshot.docs) {
        const salesData = doc.data();
        salesData.id = doc.id; // Store the unique document ID in salesData
        let receiptTotal = 0;

        // For each product in the products array, fetch the distributorPrice and calculate totals
        for (const product of salesData.products) {
          const productQuery = query(
            collection(db, 'products'),
            where('productCode', '==', product.productCode)
          );
          const productSnapshot = await getDocs(productQuery);
          
          // Assuming only one product matches the productCode in the products collection
          if (!productSnapshot.empty) {
            const productData = productSnapshot.docs[0].data();
            const { distributorPrice, bonusValue } = productData;

            // Store distributorPrice and bonusValue in the product object
            product.distributorPrice = distributorPrice;
            product.bonusValue = bonusValue;

            // Calculate the total per product
            const productTotal = product.quantity * distributorPrice;
            product.total = productTotal; // Store the total in the product object
            
            // Add to receipt total
            receiptTotal += productTotal;
          }
        }

        // Add receipt total to salesData for overall receipt total
        salesData.receiptTotal = receiptTotal;

        // Push updated sales data to sales array
        sales.push(salesData);
      }

      // Update salesTally with the fetched sales data including totals
      salesTally.value = sales;
      console.log("salesTally",salesTally.value)
    } catch (error) {
      console.error('Error fetching sales:', error);
    }
  }
};
const handleReturn = async (productCode, dispatchedAmount, shopCode, logDocId) => {
  try {
    // 1. Query the shopSupply document
    const shopSupplyQuery = query(
      collection(db, 'shopSupply'),
      where('shopCode', '==', shopCode)
    );

    const shopSupplySnapshot = await getDocs(shopSupplyQuery);

    if (!shopSupplySnapshot.empty) {
      for (const doc of shopSupplySnapshot.docs) {
        const shopSupplyData = doc.data();

        // Find the product in the DispatchedProducts array
        const productIndex = shopSupplyData.DispatchedProducts.findIndex(
          (p) => p.productCode === productCode
        );

        if (productIndex !== -1) {
          const product = shopSupplyData.DispatchedProducts[productIndex];

          // Check if the dispatchedAmount to be returned is valid
          if (dispatchedAmount <= product.dispatchedAmount) {
            // 2. Update shopSupply by reducing dispatchedAmount
            const updatedProduct = {
              ...product,
              dispatchedAmount: product.dispatchedAmount - dispatchedAmount,
            };

            const updatedProductsArray = [...shopSupplyData.DispatchedProducts];
            updatedProductsArray[productIndex] = updatedProduct;

            // Update the shopSupply document
            await updateDoc(doc.ref, { DispatchedProducts: updatedProductsArray });

            // Update the departments document
            const departmentCode = userDetails.value.departmentCode; // Get department code from userDetails
            const departmentsQuery = query(
              collection(db, 'departments'),
              where('departmentCode', '==', departmentCode)
            );

            const departmentsSnapshot = await getDocs(departmentsQuery);

            if (!departmentsSnapshot.empty) {
              for (const depDoc of departmentsSnapshot.docs) {
                const departmentsData = depDoc.data();

                // Find the product in the DispatchedProducts array in departments
                const depProductIndex = departmentsData.DispatchedProducts.findIndex(
                  (p) => p.productCode === productCode
                );

                if (depProductIndex !== -1) {
                  const depProduct = departmentsData.DispatchedProducts[depProductIndex];

                  // Add the dispatchedAmount back to the departments document
                  const updatedDepProduct = {
                    ...depProduct,
                    dispatchedAmount: depProduct.dispatchedAmount + dispatchedAmount,
                  };

                  const updatedDepartmentsArray = [...departmentsData.DispatchedProducts];
                  updatedDepartmentsArray[depProductIndex] = updatedDepProduct;

                  // Update the departments document
                  await updateDoc(depDoc.ref, { DispatchedProducts: updatedDepartmentsArray });

                  // Now check and delete from shopLogs
                  const shopLogsQuery = query(
                    collection(db, 'shopLogs'),
                    where('shopCode', '==', shopCode)
                  );

                  const shopLogsSnapshot = await getDocs(shopLogsQuery);

                  if (!shopLogsSnapshot.empty) {
                    for (const logDoc of shopLogsSnapshot.docs) {
                      if (logDoc.id === logDocId) {
                        const shopLogData = logDoc.data();

                        // Check if the dispatchedAmount in shopLogs is valid
                        if (dispatchedAmount <= shopLogData.dispatchedAmount) {
                          // 3. Delete the document from shopLogs
                          await deleteDoc(logDoc.ref);

                          // Show a success toast notification
                          Toastify({
                            text: "Product successfully returned to main stock and log deleted.",
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            backgroundColor: "#4caf50",
                          }).showToast();

                          // Reload the shopLogs after deletion
                          await fetchDispatches();
                        } else {
                          // Notify user if dispatched amount in shopLogs exceeds expected amount
                          Toastify({
                            text: "Operation failed: Dispatched amount exceeds available log quantity.",
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            backgroundColor: "#ff5722",
                          }).showToast();
                        }
                      }
                    }
                  } else {
                    console.error('No shopLogs document found for the provided shopCode');
                  }
                } else {
                  console.error('Product not found in departments');
                }
              }
            } else {
              console.error('No departments document found for the provided departmentCode');
            }
          } else {
            // Notify user if dispatchedAmount to return is greater than available amount in shopSupply
            Toastify({
              text: "Operation failed: Dispatched amount exceeds available quantity in shopSupply.",
              duration: 3000,
              gravity: "top",
              position: "right",
              backgroundColor: "#ff5722",
            }).showToast();
          }
        } else {
          console.error('Product not found in shopSupply');
        }
      }
    } else {
      console.error('No shopSupply document found for the provided shopCode');
    }

  } catch (error) {
    console.error('Error handling product return:', error);
    Toastify({
      text: "An error occurred while processing the return.",
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "#ff5722",
    }).showToast();
  }
};


// Function to update shop supply and delete a salesTally document
const updateShopSupplyAndDeleteSalesTally = async (docId) => {
  try {
    // Reference to the salesTally document using the provided docId
    const salesTallyDocRef = doc(db, "salesTally", docId);
    const salesTallyDocSnap = await getDoc(salesTallyDocRef);

    if (salesTallyDocSnap.exists()) {
      const receiptData = salesTallyDocSnap.data();
      const products = receiptData.products;

      // Query to get the shopSupply document matching the current shopCode
      const shopSupplyQuery = query(
        collection(db, "shopSupply"),
        where("shopCode", "==", selectedShopCode.value)
      );
      const shopSupplySnap = await getDocs(shopSupplyQuery);

      if (!shopSupplySnap.empty) {
        shopSupplySnap.forEach(async (docSnapshot) => {
          const shopSupplyData = docSnapshot.data();
          const updatedDispatchedProducts = [...shopSupplyData.DispatchedProducts];

          // Iterate over the products in the salesTally and update the dispatchedAmount
          products.forEach((product) => {
            const productIndex = updatedDispatchedProducts.findIndex(
              (p) => p.productCode === product.productCode
            );

            if (productIndex !== -1) {
              updatedDispatchedProducts[productIndex].dispatchedAmount += product.quantity;
            } else {
              // If product doesn't exist, add it
              updatedDispatchedProducts.push({
                productCode: product.productCode,
                dispatchedAmount: product.quantity,
              });
            }
          });

          // Update the shopSupply collection with the new dispatched amounts
          await updateDoc(doc(db, "shopSupply", docSnapshot.id), {
            DispatchedProducts: updatedDispatchedProducts,
          });
        });
      }

      // After updating shopSupply, delete the receipt from salesTally
      await deleteDoc(salesTallyDocRef);
      await fetchSalesTally()
      // Show a success toast notification
      Toastify({
                            text: "Receipt SuccessFully Deleted.",
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            backgroundColor: "#4caf50",
                          }).showToast();
    } else {
      console.error("No such receipt found!");
    }
  } catch (error) {
    console.error("Error updating shop supply or deleting receipt:", error);
   // Show a success toast notification
   Toastify({
                            text: "Error deleting Receipt.",
                            duration: 3000,
                            gravity: "top",
                            position: "right",
                            backgroundColor: "red",
                          }).showToast();
  }
};

// Example: Looping through querySnapshot to store doc.id in salesData and process each receipt
const processSalesData = (querySnapshot) => {
  const sales = [];
  for (const doc of querySnapshot.docs) {
    const salesData = doc.data();
    salesData.id = doc.id; // Store the unique document ID in salesData
    sales.push(salesData); // Add it to the sales array
  }
  salesTally.value = sales;
};

const fetchStockedProducts1 = async () => {
  const authStore = useAuthStore();

  try {
    const shopSupplyQuery = query(
      collection(db, 'shopSupply'),
      where('departmentCode', '==', authStore.userDetails.departmentCode)
    );

    const querySnapshot = await getDocs(shopSupplyQuery);
    const productsMap = new Map(); // To map productCode to dispatched amounts per shop
    const shopsSet = new Set();    // To keep track of unique shopCodes

    // Loop through each shopSupply document
    querySnapshot.forEach((doc) => {
      const shopData = doc.data();
      const shopCode = shopData.shopCode;
      shopsSet.add(shopCode); // Add shop to the list of shops

      // Loop through each product in DispatchedProducts array
      shopData.DispatchedProducts.forEach((product) => {
        const { productCode, dispatchedAmount } = product;

        // If productCode doesn't exist in the map, initialize it
        if (!productsMap.has(productCode)) {
          productsMap.set(productCode, { productCode, shops: {} });
        }

        // Add dispatchedAmount for this shopCode
        const productEntry = productsMap.get(productCode);
        productEntry.shops[shopCode] = dispatchedAmount;
      });
    });

    // Update the product list and shop list based on the map
    productList.value = Array.from(productsMap.values());
    shopList.value = Array.from(shopsSet);

    // Prepare dispatchedProductsData for displaying in the table
    dispatchedProductsData.value = productList.value.map((product) => {
      const productRow = {
        productCode: product.productCode,
      };

      // Add dispatchedAmount for each shop
      shopList.value.forEach((shopCode) => {
        productRow[shopCode] = product.shops[shopCode] || 0; // Default to 0 if no data for the shop
      });

      return productRow;
    });

    console.log('Dispatched Products Data:', dispatchedProductsData.value);
  } catch (error) {
    console.error('Error fetching dispatched products:', error);
  }
};

const fetchStockedProducts = async () => {
  const authStore = useAuthStore();

  try {
    // Fetch products from 'products' collection and map productCode to productName
    const productsSnapshot = await getDocs(collection(db, 'products'));
    const productNamesMap = new Map();

    // Loop through each product document
    productsSnapshot.forEach((doc) => {
      const productData = doc.data();
      const productCode = productData.productCode; // Assuming productCode is stored in each document
      const productName = productData.productName; // Assuming productName is stored in each document

      // Map the productCode to productName
      productNamesMap.set(productCode, productName);
    });

    const shopSupplyQuery = query(
      collection(db, 'shopSupply'),
      where('departmentCode', '==', authStore.userDetails.departmentCode)
    );

    const querySnapshot = await getDocs(shopSupplyQuery);
    const productsMap = new Map(); // Map productCode to dispatched amounts per shop
    const shopsSet = new Set();    // To track unique shopCodes

    // Loop through each shopSupply document
    querySnapshot.forEach((doc) => {
      const shopData = doc.data();
      const shopCode = shopData.shopCode;
      const shopName = shopData.shopName; // Fetch shopName from shopSupply document
      shopsSet.add({ shopCode, shopName }); // Store both shopCode and shopName

      // Loop through each product in DispatchedProducts array
      shopData.DispatchedProducts.forEach((product) => {
        const { productCode, dispatchedAmount } = product;

        // If productCode doesn't exist in the map, initialize it
        if (!productsMap.has(productCode)) {
          productsMap.set(productCode, { productCode, shops: {} });
        }

        // Add dispatchedAmount for this shopCode
        const productEntry = productsMap.get(productCode);
        productEntry.shops[shopCode] = dispatchedAmount;
      });
    });

    // Update the product list and shop list based on the map
    productList.value = Array.from(productsMap.values());
    shopList.value = Array.from(shopsSet);

    // Prepare dispatchedProductsData for displaying in the table
    dispatchedProductsData.value = productList.value.map((product) => {
      const productRow = {
        productName: productNamesMap.get(product.productCode) || product.productCode, // Use productName if available
      };

      // Add dispatchedAmount for each shop
      shopList.value.forEach((shop) => {
        productRow[shop.shopName] = product.shops[shop.shopCode] || 0; // Default to 0 if no data for the shop
      });

      return productRow;
    });

    console.log('Dispatched Products Data:', dispatchedProductsData.value);
  } catch (error) {
    console.error('Error fetching dispatched products:', error);
  }
};


const fetchSoldProducts1 = async () => {
  try {
    const departmentName = authStore.userDetails.departmentName;
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value));
    // Fetch shops based on departmentCode
    const shopsQuery = query(
      collection(db, 'SHOPS'),
      where('department', '==', departmentName)
    );
    const shopsSnapshot = await getDocs(shopsQuery);
    depShops.value = shopsSnapshot.docs.map(doc => ({
      shopCode: doc.data().shopCode,
      shopName: doc.data().shopName,
      distributorPrice: doc.data().distributorPrice,
    }));
console.log('depShops',depShops.value)
    // Fetch sales data for the selected shops
    const salesQuery = query(
      collection(db, 'salesTally'),
      where('dateEntered', '>=', startTimestamp),
      where('dateEntered', '<=', endTimestamp)
    );
    
    const salesSnapshot = await getDocs(salesQuery);
    const salesMap = {};

    salesSnapshot.forEach(doc => {
      const data = doc.data();
      data.products.forEach(product => {
        const { productCode, quantity } = product;
        // Initialize if product not already in the map
        if (!salesMap[productCode]) {
          salesMap[productCode] = { quantities: {} };
        }
        // Aggregate sales by shop
        depShops.value.forEach(shop => {
          if (data.shopCode === shop.shopCode) {
            salesMap[productCode].quantities[shop.shopCode] = 
              (salesMap[productCode].quantities[shop.shopCode] || 0) + quantity;
          }
        });
      });
    });

    soldProducts.value = Object.keys(salesMap).map(productCode => ({
      productCode,
      quantities: salesMap[productCode].quantities,
    }));

  } catch (error) {
    console.error("Error fetching sales data: ", error);
  }
};


const fetchSoldProducts = async () => {
  try {
    const departmentName = authStore.userDetails.departmentName;
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value));
    
    // Fetch shops based on departmentCode
    const shopsQuery = query(
      collection(db, 'SHOPS'),
      where('department', '==', departmentName)
    );
    const shopsSnapshot = await getDocs(shopsQuery);
    depShops.value = shopsSnapshot.docs.map(doc => ({
      shopCode: doc.data().shopCode,
      shopName: doc.data().shopName,
      distributorPrice: doc.data().distributorPrice,
    }));
    
    console.log('depShops', depShops.value);

    // Fetch sales data for the selected shops
    const salesQuery = query(
      collection(db, 'salesTally'),
      where('dateEntered', '>=', startTimestamp),
      where('dateEntered', '<=', endTimestamp)
    );
    
    const salesSnapshot = await getDocs(salesQuery);
    const salesMap = {};

    salesSnapshot.forEach(doc => {
      const data = doc.data();
      data.products.forEach(product => {
        const { productCode, quantity } = product;
        // Initialize if product not already in the map
        if (!salesMap[productCode]) {
          salesMap[productCode] = { quantities: {}, productName: '', distributorPrice: 0 };
        }
        // Aggregate sales by shop
        depShops.value.forEach(shop => {
          if (data.shopCode === shop.shopCode) {
            salesMap[productCode].quantities[shop.shopCode] = 
              (salesMap[productCode].quantities[shop.shopCode] || 0) + quantity;
          }
        });
      });
    });

    // Fetch product details from the products collection
    const productCodes = Object.keys(salesMap);
    const productsQuery = query(
      collection(db, 'products'),
      where('productCode', 'in', productCodes)
    );
    const productsSnapshot = await getDocs(productsQuery);

    // Map product details to the sales data
    productsSnapshot.forEach(doc => {
      const productData = doc.data();
      const productCode = productData.productCode;

      if (salesMap[productCode]) {
        salesMap[productCode].productName = productData.productName;
        salesMap[productCode].distributorPrice = productData.distributorPrice;
      }
    });

    // Prepare the sold products for the template
    soldProducts.value = Object.keys(salesMap).map(productCode => ({
      productCode,
      productName: salesMap[productCode].productName,
      distributorPrice: salesMap[productCode].distributorPrice,
      quantities: salesMap[productCode].quantities,
    }));

  } catch (error) {
    console.error("Error fetching sales data: ", error);
  }
};


// Computed property to disable date inputs based on selected report type
const isDateDisabled = computed(() => {
  // Disable date inputs for 'summary-stock' and 'summary-sales'
  return selectedReportType.value === '' ||selectedReportType==="stock-report";
});

// Computed property to disable shopCode input based on selected report type
const isShopCodeDisabled = computed(() => {
  // Disable shopCode selection for 'summary-stock' and 'summary-sales'
  return selectedReportType.value === 'summary-stock' || selectedReportType.value === 'summary-sales';
});



function formatTimestamp(timestamp) {
  // Check if the timestamp is valid
  if (!timestamp || typeof timestamp !== 'object' || !timestamp.seconds) {
    return 'Invalid date';
  }
  
  // Create a Date object from the Firestore Timestamp
  const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
  
  // Format the date as needed, e.g., "MM/DD/YYYY HH:MM AM/PM"
  return date.toLocaleString(); // You can customize this further if needed
}
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
// Generate report based on selected report type and shop code
const generateReport = async () => {
  if (!selectedReportType.value) {
    noDataMessage.value = 'Please select a report type.';
    return;
  }

  if (selectedReportType.value === 'stock-report' && selectedShopCode.value) {
    await fetchDispatchedProducts();

    if (dispatchedProducts.value.length === 0) {
      noDataMessage.value = 'No records found for the selected report type.';
    }
  } else if (selectedReportType.value === 'sales-report') {
    // You can add another function here to handle sales report generation
    noDataMessage.value = 'Sales report generation is not implemented yet.';
  }else if(selectedReportType.value === 'daily-tally' && selectedShopCode.value){
 await fetchSalesTally();
  }else if(selectedReportType.value === 'dispatches' && selectedShopCode.value){
  await fetchDispatches()
  }else if(selectedReportType.value === 'summary-stock'){
   await  fetchStockedProducts()
  }else if(selectedReportType.value ==='summary-sales'){
    await fetchSoldProducts()
  }
  
  else {
    noDataMessage.value = 'Invalid report type or shop code is not selected.';
  }
};
// A reactive object to store product names by productCode
const productNames = ref({});
// Fetch productName for a given productCode from Firestore
onMounted(async() => {
 
 updateDateTime();
 // Optionally, you can update the time every second
 setInterval(updateDateTime, 1000); // Update every second
 await authStore.fetchUserDetails();
 //await fetchAllProductNames();
  salesData.value = await fetchSales(selectedShopCode.value);

});

 //Open dispatch popup
const openDispatchPopup = () => {
  dialog.value = !dialog.value;
  console.log('Dispatch popup opened');
};

// Handle the close event emitted from the child component
function handleClose() {
 dialog.value = false;  // Close the dialog when 'close' is emitted
}
// Function to handle logout
const handleLogout = async () => {
  try {
    authStore.logOut(); // Call the logOut function from the auth store
  } catch (error) {
    console.error("Error logging out:", error);
  }
};




</script>

<style scoped>
body {
  background-color: #B0BEC5; /* Slate Gray */
  color: #FFFFFF; /* Ensure text is readable against the background */
  font-family: Arial, sans-serif; /* Set a clean font */
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
.user-panel {
  font-family: Arial, sans-serif;
}

.header {
  background-color: #f0f0f0;
}

.report-filters {
  background-color: #e2e8f0;
}

.btn {
  cursor: pointer;
}
</style>
