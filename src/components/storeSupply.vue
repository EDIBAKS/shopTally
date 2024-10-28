<template>
  <div class="bg-gray-700">
    <q-dialog :seamless="true" :model-value="dialogVisibility" :maximized="false" persistent>
    <q-card style="width: 100%; max-width: 850px;  background-color: #607D8B;  height: 90vh; overflow-y: auto;">
      <q-toolbar>
        <q-toolbar-title><span class="text-weight-bold text-white">Main Store</span> <span class="text-white">Dispatch</span> </q-toolbar-title>
        <q-btn @click="emit('close')" flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section>
        <div class="bg-gray-700 p-4 m-4 rounded-lg">
          <div class="w-full max-w-full">
            <div>
              <div class="flex-1">
                <div class="text-subtitle1 text-bold text-white">Select a Province</div>
                <!--
                <select v-model="selectedDepartCode" @change="handledepartmentChange"
                  class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                  <option value="" disabled>Select a Department</option>
                  <option v-for="department in fetchedDeps"
                    :key="department.departmentCode" :value="department.departmentCode" :data-name="department.departmentName">
                    {{ department.departmentName }}
                  </option>
                </select>
-->



                <select v-model="selectedDepartCode" @change="handleDepartmentChange"
  class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
  <option value="" disabled>Select a Department</option>
  <option v-for="department in fetchedDeps"
    :key="department.departmentCode"
    :value="department.departmentCode"
    :data-name="department.departmentName">
    {{ department.departmentName }}
  </option>
</select>



                <q-input
                 v-model="form.departCode"
                  label="Province Code"
                   readonly
                     label-class="text-white"
                      input-class="text-white"
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
                    <select v-model="item.productCode"
                     @change="validateProductSelection(item, index)"
                      class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-25 p-2.5">
                      <option value="" disabled>Select a Product</option>
                      <option v-for="product in shopStore.mainStock"
                        :key="product.productCode" :value="product.productCode">
                        {{ product.productName }}
                      </option>
                    </select>


                  </th>
                  <td class="px-6 py-4">
                    <q-input v-model="item.totalStock" label="Total Stk" class="text-blue-500 font-semibold text-center" readonly />
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
          <div>
    <!-- Add Item Section -->
    <div class="mt-2 flex items-center justify-between cursor-pointer">
    <!-- Left Section: Icon, Text, and Error Message -->
    <div class="flex items-center">
      <div @click="addItem" class="cursor-pointer">
        <q-icon name="add_circle_outline" size="md" color="green" />
        <span class="ml-1 text-white font-bold">Add Item</span>
      </div>
      

      <!-- Error Message -->
      <div class="ml-3 text-gray-300">
        <span v-if="errorMessage" class="error-message">
          <q-icon name="error" size="18px" class="mb-1 mr-1 text-red-500" />
          {{ errorMessage }}
        </span>
      </div>
    </div>

    <!-- Right Section: Save Button -->
    <q-btn color="primary" label="Save Dispatch" @click="saveDispatch" />
  </div>

    <!-- Save Button Section -->
    
     
    
  </div>
</div>
          
      </q-card-section>
    </q-card>
  </q-dialog>
  </div>

</template>

<script setup>

import { ref, reactive,onMounted,computed,defineEmits,nextTick } from 'vue';
import { useProductStore } from '../stores/productStore';
import { useShopStore } from '../stores/shopStore';
import { Timestamp,getDocs,collection } from 'firebase/firestore';
import{dispatchProducts} from '../services/AddDispatch'
import {db} from '../firebase'
import Toastify from 'toastify-js'; // Import Toastify for notifications
import 'toastify-js/src/toastify.css';
const productStore = useProductStore();
const shopStore=useShopStore();
const selectedDepartCode = ref('');
const errorMessage = ref('');
const form = reactive({
  departCode: '',
  departName: '',
  products: [{ productCode: '', totalStock: 0, dispAmount: 1 }],
  Status: 'NewEntry',
  date: Timestamp.now(),
});
const fetchedDeps=ref([])
// Define props
defineProps(['dialogVisibility']);
const emit = defineEmits(['close']);

//sort the products in alphabetical
const sortedProducts = computed(() => {
  return productStore.availableStock
    .filter(product => product.productName) // Ensure `productName` exists
    .sort((a, b) => a.productName.localeCompare(b.productName));
});


// Handle department change
function handledepartmentChange(event) {
  const selectedDepartCode = event.target.value;
  const selectedDepart = fetchedDeps.find(department => department.departmentCode === selectedDepartCode);

  if (selectedDepart) {
    form.departCode = selectedDepart.departmentCode;
    form.departName = selectedDepart.departmentName;
    console.log("code and name",form.departCode,form.departName)
  }
  
}


const handleDepartmentChange = (event) => {
  // Get the selected option's index
  const selectedIndex = event.target.selectedIndex;

  // Get the selected option element using the index
  const selectedOption = event.target.options[selectedIndex];

  // Get departmentName from the `data-name` attribute
  const departmentName = selectedOption.getAttribute('data-name');

  // Set form.departcode and form.departname
  form.departCode = selectedDepartCode.value;  // already set via v-model
  form.departName = departmentName;

  console.log("Selected Department Code:", form.departcode);
  console.log("Selected Department Name:", form.departname);
};



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

  const selectedProduct = shopStore.mainStock.find(
    (product) => product.productCode === item.productCode
  );

  if (selectedProduct) {
    form.products[index].totalStock = selectedProduct.totalQty || 0;
  } else {
    form.products[index].totalStock = 0; // Reset totalStock if not found
  }

  // Ensure DOM updates are finished before moving on to validate dispatch amount
  nextTick(() => {
    // You can call the dispatch validation here if needed
    validateDispatchAmount(item);
  });
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
// Function to add a new item to the form
function addItem2() {
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

const fetchDepartments = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "departments"));
    
    // Check if any documents were returned
    if (querySnapshot.empty) {
      console.log("No departments found in the collection.");
      fetchedDeps.value = [];  // Set to empty array if no departments found
    } else {
      // Populate the fetchedDeps ref with department data
      fetchedDeps.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Log the value of fetchedDeps
      console.log("Departments fetched:", fetchedDeps.value);
    }
  } catch (error) {
    console.error("Error fetching departments:", error);
  }
};


// Function to handle dispatch saving
async function saveDispatch2() {
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
    await dispatchProducts(form); 

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



function resetForm() {
  //form.departCode = '';
  //form.departName = '';
  form.products=[]
  form.products = form.products.map(product => ({
    productCode: '',
    dispAmount: 0
  }));
}
   
onMounted(async () => {
   
  await fetchDepartments();
   
  });
 


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

<style scoped>
.button-container {
  display: flex;
  justify-content: flex-end; /* Aligns the button to the extreme right */
  margin-top: 1rem; /* Margin for space at the top */
}
</style>
