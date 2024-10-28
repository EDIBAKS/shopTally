<template>
  <div class="max-w-4xl mx-auto p-4">
    <div class="mb-2"><Banner/></div>
    
    <!-- Tab Navigation -->
    <div class="mb-6">
      <div class="flex justify-center">
        <button
        @click="activeTab = 'summary'"
        :class="{'bg-blue-600 text-white': activeTab === 'summary', 'bg-gray-200 text-gray-600': activeTab !== 'summary'}"
        class="px-4 py-2 rounded-md mr-2"
      >
      Rapports
      </button>
      <button
        @click="activeTab = 'addProduct'"
        :class="{'bg-blue-600 text-white': activeTab === 'addProduct', 'bg-gray-200 text-gray-600': activeTab !== 'addProduct'}"
        class="px-4 py-2 rounded-md"
      >
      Ajouter des ventes
      </button>
      </div>
     
     
     
      

    <!-- Tab Content -->
    <div>
      <!-- Sales Summary Tab -->
      <div v-if="activeTab === 'summary'" class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-xl font-light mb-4">{{ userName }}<span class="text-gray-500 text-sm ml-2">Connecté à:{{ shopCode }}</span></h2>

        <!-- Date Pickers -->
        <div class="report-filters p-4 bg-gray-100 flex flex-col items-center gap-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 w-full">
            <div>
            <label for="shopName" class="block text-sm font-medium text-gray-700">Sélectionnez le rapport</label>
            <select v-model="selectedReportType" id="shopName"  class="p-2 border rounded mt-1 block w-full">
              <option value="" disabled>Select Report</option>
              <option value="dailySales">Daily Sales</option>
              <option value="salesTally">Monthly Tally</option>
              <option value="shopStock">Stock Report</option>
            </select>
          </div>
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700">Depuis</label>
            <input v-model="startDate" type="date" id="startDate" class="p-2 border rounded mt-1 block w-full" />
          </div>

          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700">À</label>
            <input v-model="endDate" type="date" id="endDate" class="p-2 border rounded mt-1 block w-full" />
          </div>
          </div>
         <!-- Fetch Sales Button -->
         <button @click="generateReport" class="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-500 focus:outline-none">
          Générer un rapport
        </button>
        </div>
       
       
        <div v-if="loading" class="loader flex items-center justify-center min-h-screen">
  <!-- This is the loader content -->
  <div class="text-center">
    <img src="../assets/loading2.gif" alt="Loading..." class="w-20 h-20 mx-auto mt-2"/> <!-- Adjust margin at top -->
    <p class="text-lg mb-2">Loading data, please wait...</p> <!-- Reduced bottom margin -->
   
  </div>
</div>
    <div v-else>
 <!-- Conditional Display based on report type -->
 
 <div v-if="selectedReportType === 'dailySales'">
  <div  v-if="isLoading" class="flex flex-col items-center">
    <q-spinner size="32px" color="primary" />
    <p class="text-gray-500">Loading report...</p>
  </div>
  <div v-else-if="salesTally.length">
    <ul class="mt-6 space-y-4">
        <li v-for="(receipt, index) in sortedSalesTally" :key="index" class="border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div class="flex justify-between items-center mb-2">
            <span class="font-semibold text-lg text-gray-600">Receipt No: {{ receipt.receiptNo }}</span>
            <span class="text-sm text-gray-500">
               {{ formatTimestamp(receipt.dateEntered) }}
               </span>
          </div>
          <ul class="ml-4 space-y-2">
            <li v-for="(product, pIndex) in receipt.products" :key="pIndex" class="flex justify-between">
              <span class="text-gray-700"><span class="mr-2 text-blue-900 text-bold">{{product.quantity}}</span>{{ product.productName }}
              
               <q-avatar color="gray-200" size="25px" text-color="black">${{ product.distributorPrice }}</q-avatar>
               </span> 
              <span class="font-medium text-gray-800">${{ (product.total || 0).toFixed(2) }}</span>
            </li>
          </ul>
          <div class="font-bold mt-2 text-xl">
            Total: ${{ calculateReceiptTotal(receipt.products).toFixed(2) }}
            <span class="block text-sm text-gray-600"> Total in Local Currency: {{ (calculateReceiptTotal(receipt.products) * 600).toFixed(0) }}</span>
           
          </div>
        </li>
      </ul>
      <!-- Grand Total Section -->
    <div class="mt-6 border-t pt-4 font-bold text-xl text-blue-600 flex flex-col items-center">
      Grand Total: ${{ grandTotal.toFixed(2) }}
      <span class="block text-sm text-gray-600">
        Grand Total in Local Currency: {{ (grandTotal * 600).toFixed(0) }}
      </span>
    </div>
  </div>
    
    </div>

    <div v-else-if="selectedReportType === 'salesTally'">
      <div  v-if="isLoading" class="flex flex-col items-center">
    <q-spinner size="32px" color="primary" />
    <p class="text-gray-500">Loading report...</p>
  </div>
   <div v-else-if="productData.length">
    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                  Produit
                </th>
                <th scope="col" class="px-6 py-3">
                  Init.Stock
                </th>
                <th scope="col" class="px-6 py-3">
                  Vente
                </th>
                <th scope="col" class="px-6 py-3">
                  Closing
                </th>
                
            </tr>
        </thead>
        <tbody>
            <tr  v-for="item in productData" :key="item.productCode"  class="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-200 even:dark:bg-gray-800 border-b dark:border-gray-700">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                  {{ item.productName }}
                </th>
                <td class="px-6 py-4 text-green-700 text-bold">
                  {{ item.initialStock }}
                </td>
                <td class="px-6 py-4 text-blue-800 text-bold">
                  {{ item.salesQuantity }}
                </td>
                <td class="px-6 py-4 text-black text-bold">
                  {{ item.dispatchedAmount }}
                </td>
               
            </tr>
            </tbody>
            </table>
            </div>
   </div>



    </div>

    <div v-else-if="selectedReportType === 'shopStock'">
      <div>
  <!-- Display fetched dispatched products -->
  <div  v-if="isLoading" class="flex flex-col items-center">
    <q-spinner size="32px" color="primary" />
    <p class="text-gray-500">Loading report...</p>
  </div>
  <div v-else-if="dispatchedProducts.length">
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
  
</div>


      </div>

      <!-- Add Product Tab -->
      <div v-if="activeTab === 'addProduct'" class="bg-white shadow-md rounded-lg p-6">
        

        <div class="p-4 max-w-md mx-auto">
  <h2 class="text-xl font-bold mb-4">New Receipt</h2>

  <div class="mb-4">
    <label class="block mb-1">Shop Code:</label>
    <input 
      type="text" 
      v-model="shopCode" 
      class="w-full p-2 border rounded" 
      placeholder="Enter Shop Code" 
    />
  </div>

  <div class="mb-4">
    <label class="block mb-1">Receipt No:</label>
    <input 
      type="text" 
      v-model="receiptNo" 
      class="w-full p-2 border rounded" 
      placeholder="Enter Receipt No" 
       @blur="validateReceiptNo"
    />
  </div>
  <p v-if="receiptMessage" :class="receiptError ? 'text-red-600' : 'text-green-600'">
  {{ receiptMessage }}
</p>
  <div class="mb-4">
  <label class="block mb-1">
    Produit: 
    
  </label>
  <select v-model="selectedProduct" @change="onProductSelect" class="p-2 border rounded mt-1 block w-full">
    <option value="" disabled>Select a Product</option>
    <option v-for="product in shopProducts" :key="product.productCode" :value="product">
      {{ product.productName }}
    </option>
  </select>
</div>



  <div class="mb-4">
    <label class="block mb-1">Quantity: <span class="text-red-600 float-right" v-if="dispatchedAmount">Available Stock: {{ dispatchedAmount }}</span></label>
    
    <input 
  type="number" 
  v-model.number="quantity" 
  class="w-full p-2 border rounded" 
  placeholder="Enter Quantity" 
  @blur="validateQuantity"
  ref="quantityInput" 
/>
  </div>
<!-- Display error message if validation fails -->
<p v-if="quantityError" class="text-red-600 text-sm">
  {{ quantityError }}
</p>
  <button @click="addProduct" class="w-full bg-blue-500 text-white p-2 rounded mb-4">
    Ajouter des produits
  </button>

  <div v-if="products.length > 0">
    <h3 class="text-lg font-bold mb-2">Products</h3>
    <div 
      v-for="(product, index) in products" 
      :key="index" 
      class="flex items-center justify-between mb-2 p-2 border-b">
      <div>
        <p class="text-sm"><span class="text-blue-600">{{ product.quantity}}:</span> {{ product.productName }} <span class="ml-17"> <button @click="removeProduct(index)" class="text-red-500 text-sm">
          Retirer
      </button></span></p>
        
          
        
      </div>
     
    </div>
  </div>

  <button @click="enterSales" class="w-full bg-green-500 text-white p-2 rounded" :disabled="products.length === 0">
   
Enregistrer
  </button>
</div>
     

     

     

      </div>
    </div>
    <div class="flex justify-center mt-3">
      <q-btn
      @click="handleLogout"
       style="background: red; color: white" label="Déconnexion" />
      
    </div>
    </div>
   
  </div>
</template>

<script setup>
import { ref, onMounted,reactive,watch,computed } from 'vue';
import { collection, addDoc,getDoc,doc, getDocs, updateDoc, query, where, Timestamp,onSnapshot, arrayUnion, arrayRemove  } from 'firebase/firestore';
import { db } from '../firebase'; // Firebase config
import { useShopStore } from '../stores/shopStore';
import { useAuthStore } from '@/stores/authStore';
import Toastify from 'toastify-js'; 
import 'toastify-js/src/toastify.css';
import { getSalesTallyForCurrentMonth } from '../services/salesTally';
import Banner from '../components/Banner.vue'
const shopStore = useShopStore();
const authStore=useAuthStore()
const activeTab = ref('summary');
const shopName = ref('');
const reportType=ref('')
const shopProducts=ref([])
const receiptNo = ref('')
//const shopCode = ref('')
//const shopCode = computed(() => authStore.user?.shopCode);
const shopCode =ref('')
const userName=ref('')
const selectedProduct = ref(null);
const productCode = ref('')
const productName = ref('')
const quantity = ref(1)
const products = ref([])
const receiptMessage = ref('');
const receiptError = ref(false);
const quantityError = ref(''); // Error message
const loading = ref(true); // Loading state
// Define a variable to store the dispatched amount of the selected product
const dispatchedAmount = ref(0);
const salesSummary = ref([]);
const productTally = ref([]);
const today = new Date();
const startDate = ref('');
const endDate = ref('');
// Report Type Selection
const selectedReportType = ref('dailySales'); // Default to dailySales
const salesTally = ref([]);
const dispatchedProducts = ref([]);
const noDataMessage = ref('');
const isLoading = ref(false);

// Result data
const productData = ref([]);

const onProductSelect = () => {
console.log("Selected Product:", selectedProduct.value); // Debugging
if (selectedProduct.value) {
  dispatchedAmount.value = selectedProduct.value.dispatchedAmount;
  console.log("Dispatched Amount:", dispatchedAmount.value); // Debugging
} else {
  dispatchedAmount.value = 0; // Reset if no product is selected
}
};

// Method to add selected product to the products array
const addProduct = () => {
if (selectedProduct.value) {
  const { productCode, productName } = selectedProduct.value;
  
  // Check if the product is already in the array to avoid duplicates
  const existingProduct = products.value.find(p => p.productCode === productCode);
  
  if (!existingProduct) {
    // Push the selected product's name and code to the array
    products.value.push({
      productCode: productCode,
      productName: productName,
      quantity: quantity.value
    });
  selectedProduct.value='',
    quantity.value = 1
  }
}
};

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

// Method to calculate the receipt total
function calculateReceiptTotal(products) {
  return products.reduce((acc, product) => acc + (product.total || 0), 0);
}

// Computed property to calculate the grand total of all receipts
const grandTotal = computed(() => {
  return salesTally.value.reduce((sum, receipt) => {
    return sum + calculateReceiptTotal(receipt.products);
  }, 0);
});

const removeProduct = (index) => {
products.value.splice(index, 1)
}
// Function to validate the quantity
const validateQuantity = () => {
// If the entered quantity is 0 or less
if (quantity.value <= 0) {
  quantityError.value = 'Quantity cannot be 0 or less.';
  resetQuantity(); // Reset quantity to 0 and refocus on input
} 
// If the entered quantity exceeds the available stock
else if (quantity.value > dispatchedAmount.value) {
  quantityError.value = 'Quantity cannot exceed available stock.';
  resetQuantity(); // Reset quantity to 0 and refocus on input
} 
// If the input is valid, clear the error and let the user proceed
else {
  quantityError.value = ''; // Clear error
}
};
const validateReceiptNo = async () => {
try {
  const salesTallyRef = collection(db, 'salesTally');
  const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
  const currentYear = new Date().getFullYear(); // Get current year

  // Prefix receiptNo with the shop code
  const prefixedReceiptNo = `${authStore.userDetails.shopCode}-${receiptNo.value}`;

  // Query salesTally to check if the receipt exists
  const q = query(salesTallyRef, where('receiptNo', '==', prefixedReceiptNo));
  const querySnapshot = await getDocs(q);

  let receiptExistsInCurrentMonth = false;
  let existingReceiptDate = null;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const dateEntered = data.dateEntered.toDate(); // Convert Firestore timestamp to JS Date
    const receiptMonth = dateEntered.getMonth() + 1; // Get month of receipt (1-12)
    const receiptYear = dateEntered.getFullYear(); // Get year of receipt

    // Check if the receipt exists in the same month and year
    if (receiptMonth === currentMonth && receiptYear === currentYear) {
      receiptExistsInCurrentMonth = true;
    } else {
      existingReceiptDate = dateEntered; // Store the date when it was used
    }
  });

  if (receiptExistsInCurrentMonth) {
    // If the receipt exists in the current month, clear the input, refocus, and show an error
    receiptMessage.value = 'This receipt has already been entered this month!';
    receiptError.value = true;
    receiptNo.value = ''; // Clear the input field
    nextTick(() => {
      document.getElementById('receiptNoInput').focus(); // Refocus the input field
    });
  } else if (existingReceiptDate) {
    // If the receipt exists but was used in a different month, suggest modifying the receipt
    receiptMessage.value = `Receipt was used on ${existingReceiptDate.toLocaleDateString()}. Please append a letter to the receipt number.`;
    receiptError.value = true;
    nextTick(() => {
      document.getElementById('receiptNoInput').focus(); // Refocus the input field
    });
  } else {
    // If the receipt does not exist, accept it and allow the user to proceed
    receiptMessage.value = 'Receipt number accepted!';
    receiptError.value = false;
  }

  // Update the receipt number with the prefixed value
  if (!receiptError.value) {
    receiptNo.value = prefixedReceiptNo; // Only update if no error occurred
  }

} catch (error) {
  console.error('Error checking receipt number:', error);
  receiptMessage.value = 'Error validating receipt number. Please try again.';
  receiptError.value = true;
  nextTick(() => {
    document.getElementById('receiptNoInput').focus(); // Refocus in case of error
  });
}
};
const enterSales = async () => {
  try {
    // Check if required fields are filled
    if (!authStore.userDetails.shopCode || !receiptNo.value || products.value.length === 0) {
      toast.error('Please ensure all fields are filled!');
      return;
    }

    // Create a new sales entry object
    const salesEntry = {
      shopCode: authStore.userDetails.shopCode,
      receiptNo: receiptNo.value,
      products: products.value,
      dateEntered: Timestamp.now(), // Current timestamp
      createdBy: authStore.userDetails.firstname, // Current user's first name
    };

    // Add sales entry to the `salesTally` collection
    await addDoc(collection(db, 'salesTally'), salesEntry);

    // Query the `shopSupply` collection to find the document with the current shopCode
    const shopSupplyQuery = query(
      collection(db, 'shopSupply'),
      where('shopCode', '==', authStore.userDetails.shopCode)
    );
    
    const querySnapshot = await getDocs(shopSupplyQuery);

    if (querySnapshot.empty) {
      console.error('No shop supply data found for the current shopCode.');
      showToast('Shop supply data not found!');
      return;
    }

    // Loop through the shopSupply documents (there should be only one)
    querySnapshot.forEach(async (docSnapshot) => {
      const shopSupplyData = docSnapshot.data();

      // Loop through each product in the sales entry
      for (let product of products.value) {
        // Find the matching product in the DispatchedProducts array
        const dispatchedProductIndex = shopSupplyData.DispatchedProducts.findIndex(p => p.productCode === product.productCode);

        if (dispatchedProductIndex !== -1) {
          // Calculate the new dispatched amount
          const updatedDispatchedAmount = shopSupplyData.DispatchedProducts[dispatchedProductIndex].dispatchedAmount - product.quantity;

          // Ensure dispatchedAmount doesn't go below zero
          const newDispatchedAmount = updatedDispatchedAmount >= 0 ? updatedDispatchedAmount : 0;

          // Update the specific dispatchedAmount in Firestore
          let updatedDispatchedProducts = [...shopSupplyData.DispatchedProducts];
          updatedDispatchedProducts[dispatchedProductIndex].dispatchedAmount = newDispatchedAmount;

          // Write the updated array back to Firestore
          await updateDoc(doc(db, 'shopSupply', docSnapshot.id), {
            DispatchedProducts: updatedDispatchedProducts
          });
        }
      }
    });

    // Show success Toastify alert
    showToast('Tally Entered and Dispatched Amount Updated', 'green');

    // Reset form fields after successful entry
    receiptNo.value = ''; // Clear the receipt number
    products.value = []; // Reset the products array to empty
    selectedProduct.value = null; // Reset the selected product
    quantity.value = 1; // Set the default quantity to 1
    receiptMessage.value = ''; // Clear the receipt message
    dispatchedAmount.value = null; // Reset the dispatched amount
    // Navigate to the sales summary tab (assuming a method or route navigation exists)
    navigateToSalesSummary();

  } catch (error) {
    console.error('Error entering sales and updating dispatched amount:', error);
    toast.error('Error adding sales entry or updating dispatched amount, please try again.');
  }
};

const fetchSalesSummary = async () => {
try {
  const salesTallyRef = collection(db, 'salesTally');
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Query to get salesTally for current user's shopCode and current month
  const q = query(
    salesTallyRef,
    where('shopCode', '==', authStore.userDetails.shopCode),
    where('dateEntered', '>=', new Date(currentYear, currentMonth, 1)),
    where('dateEntered', '<=', new Date(currentYear, currentMonth + 1, 0))
  );

  // Get documents once
  const querySnapshot = await getDocs(q);
  
  // Organize data by receipt
  const receipts = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const receiptNo = data.receiptNo;

    if (!receipts[receiptNo]) {
      receipts[receiptNo] = {
        receiptNo: receiptNo,
        dateEntered: data.dateEntered.toDate(), // Convert Firestore timestamp to JS Date
        products: []
      };
    }

    // Add product details to the receipt
    data.products.forEach((product) => {
      receipts[receiptNo].products.push({
        productCode: product.productCode,
        productName: product.productName,
        quantity: product.quantity
      });
    });
  });

  // Convert to array and sort by dateEntered descending
  salesSummary.value = Object.values(receipts).sort((a, b) => b.dateEntered - a.dateEntered);

} catch (error) {
  console.error('Error fetching sales summary:', error);
}
};

// Function to fetch distributor price for a product
const fetchDistributorPrice = async (productCode) => {
const productsRef = collection(db, 'products');
const q = query(productsRef, where('productCode', '==', productCode));
const querySnapshot = await getDocs(q);

let distributorPrice = 0;
querySnapshot.forEach((doc) => {
  const data = doc.data();
  distributorPrice = data.distributorPrice || 0; // Ensure fallback to 0
});
return distributorPrice;
};

const calculateSalesSummary = async () => {
  isLoading.value = true; // End loading
try {
  const salesTallyRef = collection(db, 'salesTally');
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Query to get salesTally for current user's shopCode and current month
  const q = query(
    salesTallyRef,
    where('shopCode', '==', authStore.userDetails.shopCode),
    where('dateEntered', '>=', new Date(currentYear, currentMonth, 1)),
    where('dateEntered', '<=', new Date(currentYear, currentMonth + 1, 0))
  );

  const querySnapshot = await getDocs(q);
  
  const receipts = {};
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const receiptNo = data.receiptNo;

    if (!receipts[receiptNo]) {
      receipts[receiptNo] = {
        receiptNo: receiptNo,
        dateEntered: data.dateEntered.toDate(), // Convert Firestore timestamp to JS Date
        products: [],
        total: 0
      };
    }

    // For each product in the sale, fetch the distributor price and calculate subtotal
    for (const product of data.products) {
      const distributorPrice = await fetchDistributorPrice(product.productCode);
      const subtotal = distributorPrice * product.quantity;

      receipts[receiptNo].products.push({
        productCode: product.productCode,
        productName: product.productName,
        quantity: product.quantity,
        subtotal: subtotal || 0 // Ensure fallback to 0
      });

      // Add to the total for the receipt
      receipts[receiptNo].total += subtotal || 0; // Ensure fallback to 0
    }
  }

  // Convert to array and sort by dateEntered descending
  salesSummary.value = Object.values(receipts).sort((a, b) => b.dateEntered - a.dateEntered);

} catch (error) {
  console.error('Error fetching sales summary:', error);
} finally {
    isLoading.value = false; // End loading
  }
};

// Real-time listener for salesTally updates
const setupRealTimeListener = () => {
const salesTallyRef = collection(db, 'salesTally');
const q = query(
  salesTallyRef,
  where('shopCode', '==', authStore.userDetails.shopCode)
);

onSnapshot(q, (querySnapshot) => {
  calculateSalesSummary(); // Refresh data on updates
});
};

// Mock navigation function to redirect to sales summary (replace with actual router logic)
const navigateToSalesSummary = () => {
// Set activeTab to 'summary' to navigate to the sales summary tab
activeTab.value = 'summary';
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

// Function to reset quantity to 0 and refocus on the input
const resetQuantity = () => {
quantity.value = 0; // Reset the quantity to 0
// Refocus on the input field
if ($refs.quantityInput) {
  $refs.quantityInput.focus();
}
};

// Set the default range to the current month
const setDefaultMonth = () => {
  startDate.value = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().substr(0, 10);
  endDate.value = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().substr(0, 10);
};

const fetchShopProducts = async () => {
  isLoading.value = true; // End loading
try {
  const userShopCode = authStore.userDetails.shopCode;
  const shopSupplyRef = collection(db, 'shopSupply');
  
  // Query the shopSupply collection where shopCode matches the logged-in user's shopCode
  const q = query(shopSupplyRef, where('shopCode', '==', shopCode.value));
  const querySnapshot = await getDocs(q);

  const productMap = new Map(); // Map to hold productCode and corresponding dispatchedAmount

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const dispatchedProducts = data.DispatchedProducts || [];

    // Store both productCode and dispatchedAmount in a map
    dispatchedProducts.forEach((product) => {
      productMap.set(product.productCode, product.dispatchedAmount);
    });
  });

  // Now fetch product names from the 'products' collection based on productCodes
  const productCodes = Array.from(productMap.keys());
  if (productCodes.length === 0) return; // Avoid empty queries

  const productsRef = collection(db, 'products');
  const productsQuery = query(productsRef, where('productCode', 'in', productCodes));
  const productsSnapshot = await getDocs(productsQuery);

  // Map productCode to productName and store the details
  productsSnapshot.forEach((doc) => {
    const productData = doc.data();
    const productCode = productData.productCode;
    const productName = productData.productName;

    // Get the dispatchedAmount from the productMap
    const dispatchedAmount = productMap.get(productCode);

    shopProducts.value.push({
      productCode: productCode,
      productName: productName, // Include productName for display
      dispatchedAmount: dispatchedAmount // Amount dispatched
    });
  });

} catch (error) {
  console.error('Error fetching products:', error);
} finally {
    isLoading.value = false; // End loading
  }
};

// Call the fetchProductNames function after fetching dispatched products
const fetchDispatchedProducts = async () => {
  isLoading.value = true; // End loading
  if (!shopCode.value) {
    console.warn('No shop code selected');
    noDataMessage.value = 'Please select a shop to view the report.';
    return;
  }

  try {
    // Query shopSupply collection where shopCode matches the selectedShopCode
    const q = query(collection(db, 'shopSupply'), where('shopCode', '==', shopCode.value));
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
  } finally {
    isLoading.value = false; // End loading
  }
};
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

const handleLogout = async () => {
try {
  authStore.logOut(); // Call the logOut function from the auth store
} catch (error) {
  console.error("Error logging out:", error);
}
};

//anual sales per product per month
const fetchSales = async (ShopCode) => {
  // Use the selected shopCode
  //const shopCode = ShopCode || useAuthStore().userDetails?.shopCode;

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
      where('shopCode', '==', shopCode.value),
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

const fetchSalesTally = async () => {
  isLoading.value = true; // End loading
  if ( startDate.value && endDate.value) {
    const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value));

    const salesQuery = query(
      collection(db, 'salesTally'),
      where('shopCode', '==', shopCode.value),
      where('dateEntered', '>=', startTimestamp),
      where('dateEntered', '<=', endTimestamp)
    );

    try {
      const querySnapshot = await getDocs(salesQuery);
      const sales = [];

      // Loop through each salesTally document
      for (const doc of querySnapshot.docs) {
        const salesData = doc.data();
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

    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
    isLoading.value = false; // End loading
  }
  }
};

const sortedSalesTally = computed(() => {
  if (!Array.isArray(salesTally.value)) {
    return []; // Return empty array if salesTally is not valid
  }

  // Sort by dateEntered, ensuring it is a valid Firestore Timestamp
  return [...salesTally.value].sort((a, b) => {
    const aformatTimestamp = a.dateEntered?.seconds || 0; // Fallback to 0 if missing
    const bformatTimestamp = b.dateEntered?.seconds || 0; // Fallback to 0 if missing
    return bformatTimestamp - aformatTimestamp; // Sort in descending order (latest first)
  });
});







// Function to fetch available stock, sales data, and product names
const fetchProductData1 = async () => {
  const shopSupplyData = [];
  const salesTallyMap = {}; // Use an object to accumulate sales by productCode
  const productMap = {}; // Map to store product details (productCode -> productName)

  const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
  const endTimestamp = Timestamp.fromDate(new Date(endDate.value));

  // Query to fetch dispatched products from shopSupply where shopCode matches the current user's shopCode
  const shopSupplyQuery = query(
    collection(db, 'shopSupply'),
    where('shopCode', '==', shopCode.value)
  );
  const shopSupplySnapshot = await getDocs(shopSupplyQuery);
  shopSupplySnapshot.forEach((doc) => {
    const data = doc.data();
    shopSupplyData.push(...data.DispatchedProducts); // Assuming dispatchedProducts is an array
  });

  // Query to fetch sales data from salesTally within the date range
  const salesTallyQuery = query(
    collection(db, 'salesTally'),
    where('shopCode', '==', shopCode.value),
    where('dateEntered', '>=', startTimestamp),
    where('dateEntered', '<=', endTimestamp)
  );
  const salesTallySnapshot = await getDocs(salesTallyQuery);

  // Loop through each salesTally document and accumulate sales by productCode
  salesTallySnapshot.forEach((doc) => {
    const data = doc.data();
    data.products.forEach((product) => {
      const productCode = product.productCode;

      // Accumulate sales for each productCode
      if (salesTallyMap[productCode]) {
        salesTallyMap[productCode].quantity += product.quantity; // Sum up quantities
      } else {
        salesTallyMap[productCode] = {
          productName: product.productName, // Use productName from salesTally
          quantity: product.quantity
        };
      }
    });
  });

  // Fetch product details from the products collection
  const productsQuery = collection(db, 'products');
  const productsSnapshot = await getDocs(productsQuery);
  productsSnapshot.forEach((doc) => {
    const data = doc.data();
    productMap[data.productCode] = data.productName; // Store productName with productCode as key
  });

  // Combine the results, matching productCode from both shopSupply and salesTallyMap
  const result = shopSupplyData.map((shopProduct) => {
    const matchingSalesProduct = salesTallyMap[shopProduct.productCode];
    const productName = productMap[shopProduct.productCode] || "Unknown Product"; // Use productName from productMap

    if (matchingSalesProduct) {
      const availableStock = shopProduct.dispatchedAmount - matchingSalesProduct.quantity;
      const initialStock = shopProduct.dispatchedAmount + matchingSalesProduct.quantity; // Calculate initialStock

      return {
        productCode: shopProduct.productCode,
        productName: productName, // Always have productName, even without sales
        dispatchedAmount: shopProduct.dispatchedAmount,
        salesQuantity: matchingSalesProduct.quantity,
        availableStock: availableStock,
        initialStock: initialStock
      };
    }

    // If no sales data for this product, return with available stock equal to dispatched amount
    return {
      productCode: shopProduct.productCode,
      productName: productName, // Use productName from productMap
      dispatchedAmount: shopProduct.dispatchedAmount,
      salesQuantity: 0, // No sales
      availableStock: shopProduct.dispatchedAmount, // All stock available
      initialStock: shopProduct.dispatchedAmount // Initial stock is just the dispatched amount
    };
  });

  productData.value = result; // Update the reactive data
};


// Function to fetch available stock, sales data, and product names
const fetchProductData = async () => {
  const isLoading = ref(true);
  try {
    const shopSupplyData = [];
    const salesTallyMap = {}; // Use an object to accumulate sales by productCode
    const productMap = {}; // Map to store product details (productCode -> productName)

    const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
    const endTimestamp = Timestamp.fromDate(new Date(endDate.value));

    // Query to fetch dispatched products from shopSupply where shopCode matches the current user's shopCode
    const shopSupplyQuery = query(
      collection(db, 'shopSupply'),
      where('shopCode', '==', shopCode.value)
    );
    const shopSupplySnapshot = await getDocs(shopSupplyQuery);
    shopSupplySnapshot.forEach((doc) => {
      const data = doc.data();
      shopSupplyData.push(...data.DispatchedProducts); // Assuming dispatchedProducts is an array
    });

    // Query to fetch sales data from salesTally within the date range
    const salesTallyQuery = query(
      collection(db, 'salesTally'),
      where('shopCode', '==', shopCode.value),
      where('dateEntered', '>=', startTimestamp),
      where('dateEntered', '<=', endTimestamp)
    );
    const salesTallySnapshot = await getDocs(salesTallyQuery);

    // Loop through each salesTally document and accumulate sales by productCode
    salesTallySnapshot.forEach((doc) => {
      const data = doc.data();
      data.products.forEach((product) => {
        const productCode = product.productCode;

        // Accumulate sales for each productCode
        if (salesTallyMap[productCode]) {
          salesTallyMap[productCode].quantity += product.quantity; // Sum up quantities
        } else {
          salesTallyMap[productCode] = {
            productName: product.productName, // Use productName from salesTally
            quantity: product.quantity,
          };
        }
      });
    });

    // Fetch product details from the products collection
    const productsQuery = collection(db, 'products');
    const productsSnapshot = await getDocs(productsQuery);
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      productMap[data.productCode] = data.productName; // Store productName with productCode as key
    });

    // Combine the results, matching productCode from both shopSupply and salesTallyMap
    const result = shopSupplyData.map((shopProduct) => {
      const matchingSalesProduct = salesTallyMap[shopProduct.productCode];
      const productName = productMap[shopProduct.productCode] || 'Unknown Product'; // Use productName from productMap

      if (matchingSalesProduct) {
        const availableStock = shopProduct.dispatchedAmount - matchingSalesProduct.quantity;
        const initialStock = shopProduct.dispatchedAmount + matchingSalesProduct.quantity; // Calculate initialStock

        return {
          productCode: shopProduct.productCode,
          productName: productName, // Always have productName, even without sales
          dispatchedAmount: shopProduct.dispatchedAmount,
          salesQuantity: matchingSalesProduct.quantity,
          availableStock: availableStock,
          initialStock: initialStock,
        };
      }

      // If no sales data for this product, return with available stock equal to dispatched amount
      return {
        productCode: shopProduct.productCode,
        productName: productName, // Use productName from productMap
        dispatchedAmount: shopProduct.dispatchedAmount,
        salesQuantity: 0, // No sales
        availableStock: shopProduct.dispatchedAmount, // All stock available
        initialStock: shopProduct.dispatchedAmount, // Initial stock is just the dispatched amount
      };
    });

    productData.value = result; // Update the reactive data

  } catch (error) {
    console.error("Error fetching product data:", error); // Handle any errors that occur
  }finally {
    isLoading.value = false; // End loading
  }
};






// Fetch data on component mount or on user action
onMounted(async () => {
  const data = await fetchProductData();
  console.log(data); // Log the data or use it in the template
});





// Generate report based on selected report type and shop code
const generateReport = async () => {
  if (!selectedReportType.value) {
    noDataMessage.value = 'Please select a report type.';
    return;
  }

  if (selectedReportType.value === 'shopStock' && shopCode.value) {
    await fetchDispatchedProducts();

  } else if (selectedReportType.value === 'dailySales') {
    //await fetchDispatchedProducts();
    await fetchSalesTally()
   
 }else if(selectedReportType.value === 'salesTally' && shopCode.value){
 await fetchProductData();
  }else if(selectedReportType.value === 'dispatches' && shopCode.value){
  await fetchDispatches()
  }else {
    noDataMessage.value = 'Invalid report type or shop code is not selected.';
  }
};

onMounted(async () => {
  // Fetch shopCode from authStore's userDetails
  if (authStore.userDetails && authStore.userDetails.shopCode) {
    shopCode.value = authStore.userDetails.shopCode;
    userName.value=authStore.userDetails.firstname;
  }

  try {
   
    await fetchShopProducts();    // Fetch shop products
    //await calculateSalesSummary(); // Calculate the sales summary
    //setupRealTimeListener();      // Setup real-time listener
   
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    // Set loading to false once data fetching is complete
    loading.value = false;
  }
 
});

</script>

<style scoped>
/* Small screen styles */
@media (max-width: 640px) {
input {
  font-size: 0.875rem;
}
}
</style>
