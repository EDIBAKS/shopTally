<template>
    <header class="w-full h-16 bg-white-300 text-black flex items-center justify-between px-4 mt-2 border">
      <!-- Left Section -->
      <div class="flex items-center">
       
        <div>
          <p class="text-h8 mb-0 text-gray-500 font-semibold">
            
           {{ userFirstName }}
           <span>{{userLastName  }}</span>
           </p>
          <p class="text-h8 mt-0  text-black font-bold">
            
             <span>{{ currentDateTime }}</span> <!-- Display current date and time --></p> 
            
        </div>
       
      </div>
  
      <!-- Center Section -->
      <div class="flex justify-center flex-1">
        <p class="text-lg font-bold">{{userDepartment}}</p>
      </div>
  
      <!-- Right Section -->
      <div class="flex items-center">
        
        <div @click="togglePopup"  class="cursor-pointer mr-3">
          
        <q-btn  
         flat round color="purple" size="20px" icon="post_add" />
         <span><strong>Add Dispatch</strong></span>
        </div>
       
         
        <q-avatar size="45px">
  <img src="../assets/download.png" alt="User Avatar" />
</q-avatar>
         <span class="cursor-pointer"><strong>LogOut</strong></span>
         
      
        
      </div>
    </header>
  
    <!-- Popup Modal (conditionally rendered) -->
    <div v-if="isPopupOpen"
     class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overflow-x-hidden bg-gray-900 bg-opacity-50 pt-10"
>

<div class="relative w-full max-w-2xl h-full md:h-auto">
   <!-- Modal Content -->
   <div class="relative bg-white bg-opacity-75 backdrop-blur-lg rounded-lg shadow dark:bg-gray-700 dark:bg-opacity-75">

<!-- Modal Header -->
<div
  class="flex items-center justify-between p-5 border-b rounded-t dark:border-gray-600"
>
  <h3 class="text-xl font-medium text-gray-900 dark:text-white">
    Add  Dispatch
  </h3>
  <q-btn @click="togglePopup" flat round color="red" icon="close" />
</div>

 <!-- Modal Body -->
 <div class="p-6 space-y-6">
              <label class="text-h6" for="options">Select a shop:</label>
              <select
                v-model="selectedShop"
                class="block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              >
                <option selected>select a shop</option>
                <option
                
                  v-for="shop in productStore.shops"
                  :key="shop.shopCode"
                  :value="shop.shopCode"
                >
                  {{ shop.shopName }}
                </option>
              </select>
              <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                    Product name
                </th>
                <th scope="col" class="px-6 py-3">
                    quantity
                </th>
                <th scope="col" class="px-6 py-3 bg-gray-50 dark:bg-gray-800">
                    actions
                </th>
              
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in form.items"
            :key="index" class="border-b border-gray-200 dark:border-gray-700">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap bg-gray-50 dark:text-white dark:bg-gray-800">
                  <select
                        v-model="item.productCode"
                        class="block w-15 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      >
                        <option selected>select a product</option>
                        <option
                          v-for="product in products"
                          :key="product.productCode"
                          :value="product.productCode"
                          
                        >
                          {{ product.productName }}
                        </option>
                      </select>
                </th>
                <td class="px-6 py-4">
                  <input
                        type="number"
                        v-model.number="item.quantity"
                        id="small-input"
                        class="block w-20 p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      min="1"
                      step="1"
                      
                      />
                </td>
                <td class="px-6 py-4 bg-gray-50 dark:bg-gray-800">
                  <div
                        @click="removeItem(index)"
                        class="flex items-center justify-center h-full cursor-pointer"
                      >
                        <svg
                          class="w-6 h-6 text-red-600 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                          />
                        </svg>
                        <span class="font-bold text-red-600">delete</span>
                      </div>
                </td>
               
            </tr>
 
           
           
        </tbody>
    </table>
</div>

</div>

</div>
</div>
      
    </div>
  </template>
  
  <script setup>
  import { ref,onMounted,reactive } from 'vue'
  import { collection, getDocs, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
  import { useAuthStore } from '../stores/authStore' // Assuming you have the authStore
  const authStore = useAuthStore()
  import { useProductStore } from '../stores/productStore'; // Access the productStore

const productStore = useProductStore();
const shops = productStore.shops;  // Get the shops from the store

 
  const currentDateTime = ref('');
  // Retrieve user details
const userFirstName = authStore.userDetails?.firstname || 'Guest'
const userLastName=authStore.userDetails?.lastname || '?'
const userDepartment = authStore.userDetails?.department || 'N/A'
const isPopupOpen = ref(false)
const selectedShop = ref(null);
const form = reactive({
  selectedShop: '',
  items: [{ productCode: '', quantity: 1 }],
  Status: 'New Order',
  date: Timestamp.now(),
});
  const togglePopup = () => {
    isPopupOpen.value = !isPopupOpen.value
  }

  // Function to get the current date and time
const updateDateTime = () => {
  const now = new Date();
  const formattedDateTime = now.toLocaleString(); // Format as per your preference
  currentDateTime.value = formattedDateTime;
};

// Update date and time when the component mounts
onMounted(() => {
 
  updateDateTime();
  // Optionally, you can update the time every second
  setInterval(updateDateTime, 1000); // Update every second
});
  </script>
  