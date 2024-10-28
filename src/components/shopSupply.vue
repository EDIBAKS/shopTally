<template>
  <div class=" bg-gray-100">
    <q-dialog :seamless="true" :model-value="dialogVisibility" :maximized="false" persistent>
    <q-card style="width: 100%; max-width: 850px; height: 90vh; overflow-y: auto;">
      <q-toolbar>
        <q-toolbar-title><span class="text-weight-bold">Shop</span> Supply</q-toolbar-title>
        <q-btn @click="emit('close')" flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section>
        <div class=" bg-gray-100 p-4 m-4 rounded-lg">
          <div class="w-full max-w-full">
            <div>
              <div class="q-pa-md flex justify-end items-center">
    <q-radio
      v-model="shopSelection"
      val="myShops"
      label="My Shops"
      left-label
      color="primary"
      class="text-sm q-mr-md"
    />
    <q-radio
      v-model="shopSelection"
      val="allShops"
      label="All Shops"
      left-label
      color="primary"
      class="text-sm"
    />
  </div>
   
              <div class="flex-1">

                
                <div class="text-subtitle1 text-bold text-black">Shop</div>
                
                <select
  v-model="selectedDepartCode"
  @change="handleshopChange"
  class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
>
  <option value="" disabled>Select a shop</option>
  <option
    v-for="shop in shopStore.shops"
    :key="shop.shopCode"
    :value="shop.shopCode"
    :data-name="shop.shopName"
  >
    {{ shop.shopName }}
  </option>
</select>




<!--
                <select v-model="selectedDepartCode" @change="handledepartmentChange"
                  class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                  <option value="" disabled>Select a Department</option>
                  <option v-for="department in productStore.fetchedDeps.sort((a, b) => a.departmentName.localeCompare(b.departmentName))"
                    :key="department.departmentCode" :value="department.departmentCode" :data-name="department.departmentName">
                    {{ department.departmentName }}
                  </option>
                </select>
                -->
                <q-input
                 v-model="form.shopCode"
                  label="Shop Code"
                   readonly
                     label-class="text-white"
                      input-class="text-black"
                    />
              </div>
            </div>
          </div>

          <div class="relative overflow-x-auto">
            <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ">
                <tr>
                  <th scope="col" class="px-6 py-3">Product name</th>
                  <th scope="col" class="px-6 py-3">Available Stock</th>
                  <th scope="col" class="px-6 py-3">Dispatch Amount</th>
                  <th scope="col" class="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in form.products" :key="index"
                  class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    <!--
                    <select v-model="item.productCode" @change="validateProductSelection(item, index)"
                      class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-25 p-2.5">
                      <option value="" disabled>Select a Product</option>
                      <option v-for="product in productStore.availableStock.sort((a, b) => a.productName.localeCompare(b.productName))"
                        :key="product.id" :value="product.productCode">
                        {{ product.productName }}
                      </option>
                    </select>
-->

                    <select v-model="item.productCode"  @change="validateProductSelection(item, index)"
                      class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-25 p-2.5">
                      <option value="" disabled>Select a Product</option>
                      <option v-for="product in shopStore.departmentProducts"
                        :key="product.productCode" :value="product.productCode">
                        {{ product.productName }}
                      </option>
                    </select>



                  </th>
                  <td class="px-6 py-4">
                    <q-input v-model="item.totalStock" label="Available Stk" class="text-blue-500 font-semibold text-center" readonly />
                  </td>
                  <td class="px-6 py-4">
                    <q-input v-model="item.dispAmount" label="Amount Disp"  />
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex justify-center items-center">
                      <q-icon name="remove_circle" size="25px" color="red" @click="removeItem(index)" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>


          <div class="mt-2 flex items-center justify-between cursor-pointer">
    <!-- Left Section: Icon, Text, and Error Message -->
    <div class="flex items-center">
      <div @click="addItem" class="cursor-pointer" >
        <q-icon name="add_circle_outline" size="md" color="green" />
        <span class="ml-1 text-black font-bold">Add Item</span>
      </div>
    

      <!-- Error Message -->
      <div class="ml-3 text-red-600">
        <span v-if="errorMessage" class="error-message">
          <q-icon name="error" size="18px" class="mb-1 mr-1 text-red-500" />
          {{ errorMessage }}
        </span>
      </div>
    </div>

    <!-- Right Section: Save Button -->
    <q-btn color="primary" label="Save Dispatch" @click="saveDispatch" />
  </div>

<!--
          <div class="mt-2 flex">
            <q-btn round color="green" :size="size" icon="add_circle_outline" @click="addItem" />
            <span class="ml-1 text-black"><strong>Add Item</strong></span>
            <div class="ml-3 text-red-600">
              <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
            </div>
          </div>
           <div class="mt-4">
            <q-btn color="primary" label="Save Dispatch" @click="saveDispatch" />
          </div>
-->
          <!-- Save Button to trigger the function -->
         
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  </div>

</template>
<script setup>
import { ref, reactive,onMounted,computed,defineEmits,watch,nextTick } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useShopStore } from '../stores/shopStore';
import { useAuthStore } from '../stores/authStore';
import { dispatchtoShop } from '../services/addShopSupply';
import Toastify from 'toastify-js'; // Import Toastify for notifications
import 'toastify-js/src/toastify.css';
const authStore = useAuthStore();
import { Timestamp } from 'firebase/firestore';
const errorMessage = ref('');
// Destructure store properties
//const { fetchShops, shops, isLoading, error } = shopStore;
const shopStore = useShopStore();
const shopSelection = ref('myShops'); // Default selection: My Shops
const selectedShopCode = ref(''); // Bind the selected shop
defineProps(['dialogVisibility']);
const emit = defineEmits(['close']);
const form = reactive({
  shopCode: '',
  shopName: '',
  products: [{ productCode: '', totalStock: 0, dispAmount: 1 }],
  Status: 'NewEntry',
  departName: '',
  departCode: '',
  date: Timestamp.now(),
});
// Fetch shops on mount
// Watch the radio button selection and call the corresponding fetch function
watch(shopSelection, (newSelection) => {
  if (newSelection === 'myShops') {
    shopStore.fetchShops(false); // Fetch shops for the current department
  } else if (newSelection === 'allShops') {
    shopStore.fetchShops(true); // Fetch all shops
  }
});

// Fetch the default shops (for the current department) when the component is mounted
onMounted(() => {
  shopStore.fetchShops(false); // Initially fetch shops for the user's department
  if (authStore.userDetails) {
        form.departName = authStore.userDetails.departmentName;
        form.departCode = authStore.userDetails.departmentCode;
        console.log("department",form.departName,form.departCode)
      }
});


// Watch for changes in departmentName and departmentCode
watch([form.departName, form.departCode], ([newDeptName, newDeptCode]) => {
  console.log('Department Name changed to:', newDeptName);
  console.log('Department Code changed to:', newDeptCode);
  // React to the changes here, such as updating the UI or triggering actions
});



// Function to handle product selection and update totalStock

function validateProductSelection(item, index) {
  const existingProductIndex = form.products.findIndex(
    (product) => product.productCode === item.productCode && form.products.indexOf(product) !== index
  );

  if (existingProductIndex !== -1) {
    errorMessage.value = 'This product is already selected in the list.';
    form.products[index].totalStock = 0; // Reset totalStock
    return;
  } else {
    errorMessage.value = '';
  }

  const selectedProduct = shopStore.departmentProducts.find(
    (product) => product.productCode === item.productCode
  );

  if (selectedProduct) {
    form.products[index].totalStock = selectedProduct.dispatchedAmount || 0;
  } else {
    form.products[index].totalStock = 0; // Reset totalStock if not found
  }

  // Ensure DOM updates are finished before moving on to validate dispatch amount
  //nextTick(() => {
    // You can call the dispatch validation here if needed
    //validateDispatchAmount(item);
// });
}






function validateDispatchAmount(item) {
  if (item.dispAmount <= 0) {
    errorMessage.value = 'Dispatch amount must be greater than 0.';
    item.dispAmount = 1; // Reset to a valid default value
    return false; // Return false to indicate an invalid state
  } else if (item.dispAmount > item.totalStock) {
    errorMessage.value = 'Dispatch amount cannot exceed available stock.';
    item.dispAmount = 1; // Reset to a valid default value
    return false; // Return false to indicate an invalid state
  }

  // Clear error if everything is valid
  errorMessage.value = '';
  return true; // Return true if valid
}



// Function to add a new item to the form
function addItem() {
  // Validate each product entry
  for (let i = 0; i < form.products.length; i++) {
    const item = form.products[i];

    // Validate if any fields are incomplete or have incorrect values
    if (!item.productCode || item.totalStock < 0 || item.dispAmount < 1) {
      errorMessage.value = 'Please complete all fields for existing items before adding a new one.';
      return;
    }

    // Validate dispatch amount for each product
    if (!validateDispatchAmount(item)) {
      // Focus on the item that has an issue and prevent adding a new item
      errorMessage.value = `Issue with product at row ${i + 1}: Dispatch amount cannot exceed available stock.`;
      return; // Stop execution if there is an issue
    }
  }

  // If all validations pass, clear the error message and add a new item
  errorMessage.value = ''; // Clear error if validations pass
  form.products.push({ productCode: '', totalStock: 0, dispAmount: 1 });
}

// Function to remove an item from the form
function removeItem(index) {
  form.products.splice(index, 1);
}


// Handle department change
function handleshopChange(event) {
  const selectedShopCode = event.target.value;
  const selectedShop = shopStore.shops.find(shop => shop.shopCode === selectedShopCode);

  if (selectedShop) {
    form.shopCode = selectedShop.shopCode;
    form.shopName = selectedShop.shopName;
  }
}


async function saveDispatch() {
  // Check if department code is not empty and products array has at least one item
  if (!form.departCode || !form.departName || !form.products.length) {
    errorMessage.value = 'Department code, department name, and products are required.';
    return;
  }

  // Validate that every product has a productCode and a dispatch amount greater than 0
  const areProductsValid = form.products.every(
    product => product.productCode && product.dispAmount > 0
  );

  if (!areProductsValid) {
    errorMessage.value = 'Please ensure all products have a valid code and dispatch amount greater than 0.';
    return;
  }

  errorMessage.value = ''; // Reset error message

  try {
    // Call the function to dispatch the products
    await dispatchtoShop(form); 

    // Show success message and reset form
    showToast('Dispatch saved successfully!', 'green');
    resetForm();
    
    // Emit the close event to close the modal or form
    emit('close');
  } catch (error) {
    console.error('Error submitting dispatch:', error);
    errorMessage.value = 'There was an error saving the dispatch. Please try again.';
  }
}


//function for tostify
const showToast = (message, color) => {
  Toastify({
    text: message,
    duration: 5000,
    close: true,
    gravity: "top", 
    position: "right",
    backgroundColor: color,
  }).showToast();
};


function resetForm() {
  //form.departCode = '';
  //form.departName = '';
  form.products=[]
  form.products = form.products.map(product => ({
    productCode: '',
    dispAmount: 0
  }));
}
    
</script>






<!--
<script setup>
import { ref, reactive,onMounted,computed,defineEmits,watch } from 'vue';
import { useProductStore } from '../stores/productStore';
import { Timestamp } from 'firebase/firestore';
//import{dispatchProducts} from '../services/AddDispatch'

import { useShopStore } from '../stores/shopStore';
const shopStore = useShopStore();

const selectedShopType = ref('myShops');
import Toastify from 'toastify-js'; // Import Toastify for notifications
import 'toastify-js/src/toastify.css';
const productStore = useProductStore();
const selectedDepartCode = ref('');
const errorMessage = ref('');
const form = reactive({
  departCode: '',
  departName: '',
  products: [{ productCode: '', totalStock: 0, dispAmount: 1 }],
  Status: 'NewEntry',
  date: Timestamp.now(),
});

// Define props
defineProps(['dialogVisibility']);
const emit = defineEmits(['close']);

//sort the products in alphabetical
//const sortedProducts = computed(() => {
  //return productStore.availableStock
    //.filter(product => product.productName) // Ensure `productName` exists
    //.sort((a, b) => a.productName.localeCompare(b.productName));
//});


// Handle department change
function handledepartmentChange(event) {
  const selectedDepartCode = event.target.value;
  const selectedDepart = productStore.fetchedDeps.find(department => department.departmentCode === selectedDepartCode);

  if (selectedDepart) {
    form.departCode = selectedDepart.departmentCode;
    form.departName = selectedDepart.departmentName;
  }
}

// Validate product selection to avoid duplicates
function validateProductSelection(item, index) {
  const duplicateProduct = form.products.some((product, i) => product.productCode === item.productCode && i !== index);

  if (duplicateProduct) {
    errorMessage.value = 'This product is already included in the dispatch!';
    item.productCode = ''; // Reset the selection
    return;
  }

  // Fetch and update the total stock
  updateTotalStock(item);
}

// Function to fetch and update the total stock of the selected product
function updateTotalStock(item) {
  const selectedProduct = productStore.availableStock.find(product => product.productCode === item.productCode);

  if (selectedProduct) {
    item.totalStock = selectedProduct.totalQty;
  } else {
    item.totalStock = 0;
    item.dispAmount = 1;
  }
}

// Validate dispatch amount on blur
function validateDispatchAmount(item) {
  if (item.dispAmount <= 0) {
    errorMessage.value = 'Dispatch amount must be greater than 0.';
    item.dispAmount = 1;
  } else if (item.dispAmount > item.totalStock) {
    errorMessage.value = 'Dispatch amount cannot exceed available stock.';
    item.dispAmount = item.totalStock;
  }
}



// Function to add a new item to the form
function addItem() {
  const hasIncompleteItem = form.products.some(item => !item.productCode || item.totalStock < 0 || item.dispAmount < 1);

  if (hasIncompleteItem) {
    errorMessage.value = 'Please complete all fields for existing items before adding a new one.';
    return;
  }

  errorMessage.value = '';
  form.products.push({ productCode: '', totalStock: 0, dispAmount: 1 });
}

// Function to remove an item from the form
function removeItem(index) {
  form.products.splice(index, 1);
}





// Function to handle dispatch saving
async function saveDispatch() {
  // Validate that the form is properly filled
  const isValid = form.departCode && form.products.every(product => product.productCode && product.dispAmount > 0);

  if (!isValid) {
    errorMessage.value = 'Please fill in all required fields.';
    return;
  }

  errorMessage.value = ''; // Reset error message

  try {
    await dispatchProducts(form); // Call the dispatch function
//await handleDispatch(form.departCode, form.departName, form.products);
showToast('Dispatch saved successfully!', 'green');
resetForm();
emit('close');
  } catch (error) {
    console.error('Error submitting dispatch:', error);
  }
}


function resetForm() {
  form.departCode = '';
  form.departName = '';
  form.products = form.products.map(product => ({
    productCode: '',
    dispAmount: 0
  }));
}
    
 


//function for tostify
const showToast = (message, color) => {
  Toastify({
    text: message,
    duration: 5000,
    close: true,
    gravity: "top", 
    position: "right",
    backgroundColor: color,
  }).showToast();
};

 


</script>
-->