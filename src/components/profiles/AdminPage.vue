<template>
  <div class="relative overflow-x-auto shadow-md sm:rounded-lg w-full">
   

 <div class="flex flex-col ml-5">
  <div class="content mt-10 px-6">
    
  <q-card flat bordered class="mb-4  bg-transparent" style="border-color: white;">
    <q-card-section class="text-h6">
      <div class="text-h6 text-white"> Data Form <q-icon name="note_add" size="22px" /> </div>
   
  </q-card-section>
          <q-card-section>
           
            <div v-if="authStore.isDivVisible" class="grid grid-cols-3 gap-4 mt-2">
              <div class="stat-card bg-gray-100 text-black p-4 rounded-md">
                <div>
            <div class="q-gutter-md" style="max-width: 300px">
              <div class="text-h6 mb-2 text-black">Register New User</div>
              <form  @submit.prevent="handleSubmit">
                <q-input v-model="email" type="email" label="email" />
              <q-input v-model="password" type="password" label="password" />
              <q-input v-model="password2" type="password" label="repeat password" />
              <q-input v-model="firstname" type="text" label="first name" />
              <q-input v-model="lastname" type="text" label="last name" />

              <select 
              v-model="UserRole"
              @change="fetchDepartmentCode"
              id="countries" 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 font-bold mt-1">
    <option selected>Choose User Rights</option>
   <option value="Attendant">Attendant</option> 
   <option value="Admin">Admin</option>
   <option value="Shop">Shop</option>  
  </select>

              <select 
              v-model="department2"
              @change="fetchDepartmentCode"
              id="countries" 
              class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 font-bold mt-1">
    <option selected>Choose a Department</option>
   <option v-for="department in departs" :key="department.departmentCode" :value="department.departmentName">{{ department.departmentName }}</option>
  </select>
  <q-input v-model="departCode" type="text" label="Code" />
  <q-input v-model="telephone" type="text" label="telephone" />
  <div class="mt-2">
    <button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Register</button>
  </div>
 
              </form>
             
              
              </div></div></div>
              <div class="stat-card bg-gray-100 text-black p-4 rounded-md">
                <div class="text-h6 mb-2 text-black">Register New Shop</div>

<div class="q-gutter-md" style="max-width: 300px">
  
  <q-input v-model="shopCode" @blur="checkShopExists" label="ShopCode" />
  <q-input v-model="shopName" label="Standard" />
  <div class="mr-2">
    <div class="text-caption">Select a Province</div>
    <select v-model="department" id="countries"
    class="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5">
    <option selected>Choose a Department</option>
    <option v-for="department in departs" :key="department.code" :value="department.name">
      {{ department.name }}
    </option>
  </select>
  </div>
 
  </div>




<div class="flex justify-center gap-4 mt-4">
  <q-btn v-if="shopExists" color="green" label="Update" @click="updateShop" />
  <q-btn v-if="shopExists" color="negative" label="Delete" @click="deleteShop" />
  <q-btn @click="saveShop" color="primary" label="Register" />
</div>

<div class="text-h6 mb-2 text-black mt-2">Register New Department</div>
          <div class="q-gutter-md">
            <q-input v-model="pcode" label="CODE example P01" />
            <q-input v-model="pname" label="Name" />
          </div>
          <div class="flex justify-center mt-4">
            <q-btn @click="registerDepartment" color="primary" label="Create Province" />
          </div>


              </div>
              <div class="stat-card bg-gray-100 text-black p-4 rounded-md">
                
            <div class="w-full max-w-md">
            <div class="q-gutter-md mb-4">
              <div class="text-h6 mb-2 text-black">Edit or Delete from Main store</div>
              <div class="">
                <select v-model="selectedProductCode" @change="handleProductChange"
                class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                <option value="" disabled>Select a Product</option>
                <option v-for="product in productStore.products.sort((a, b) => a.productName.localeCompare(b.productName))"
                  :key="product.id" :value="product.productCode" :data-name="product.productName">
                  {{ product.productName }}
                </option>
              </select>
              </div>
             
              <q-input v-model="productCode" label="Product Code" />
             
              <q-input v-model="totalQty" type="number" label="Quantity" />
            </div>
            <div class="flex justify-center gap-1 mt-4">
              <q-btn @click="saveProductStock" color="green" label="Edit" />
              <q-btn @click="saveProductStock" color="red" label="Delete" />
            </div>
          </div>
          </div>
          <div class="stat-card bg-gray-100 text-black p-4 rounded-md">
                
                <div class="w-full max-w-md">
            <div class="q-gutter-md mb-4">
              <div class="text-h6 mb-2 text-black">Add Product to Main Store</div>
              <select v-model="selectedProductCode" @change="handleProductChange"
              class="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5">
                <option value="" disabled>Select a Product</option>
                <option v-for="product in productStore.products.sort((a, b) => a.productName.localeCompare(b.productName))"
                  :key="product.id" :value="product.productCode" :data-name="product.productName">
                  {{ product.productName }}
                </option>
              </select>
              <q-input v-model="productCode" label="Product Code" />
              <q-input v-model="totalQty" type="number" filled label="Quantity" />
            </div>
            <div class="flex justify-center mt-4">
              <q-btn @click="saveProductStock" color="primary" label="Add Product" />
            </div>
          </div>

              </div>
         

             
            </div>
          </q-card-section>
        </q-card>
  
        <!-- Additional Content Here -->
        <div class=" gap-4 p-4 bg-transparent text-white">
          <table>
      <thead>
        <tr class="text-black">
          
          <th>Product Name</th>
          <th>Total Qty</th>
          <!-- Render department names as columns -->
          <th v-for="department in departments" :key="department.code" >{{ department.departmentName }}</th>
        </tr>
      </thead>
      <tbody>
        <!-- Render each product as a row -->
        <tr v-for="product in products" :key="product.productCode">
          
          <td>{{ product.productName }}</td>
          <td>{{ getTotalQty(product.productCode) }}</td>
          <!-- Render dispatched amounts per department -->
          <td v-for="department in departments" :key="department.code">
            {{ getDispatchedAmount(product.productCode, department.departmentCode) }}
          </td>
        </tr>
      </tbody>
    </table>


        </div>
      </div>
    </div>
</div>
</template>

  
<script setup>
import { ref,onMounted,computed,reactive,watch,defineEmits } from 'vue'
import { useProductStore } from '../../stores/productStore';
import { storeProductStock } from '../../services/firebaseService'; // Adjust the path as necessary
import { getFirestore,collection, query, where, getDocs,getDoc,addDoc, updateDoc, deleteDoc, doc,serverTimestamp,Timestamp,writeBatch,onSnapshot} from 'firebase/firestore';
import storeSupply from '../storeSupply.vue';
import { fetchProducts, fetchDepartments } from '../../services/FetchMainDispatches'
import { fetchDispatchLogs,removeDispatchLogAndUpdateStock } from '../../services/fetchDepartmentsLogs';
 import { useAuthStore } from '../../stores/authStore';

const authStore = useAuthStore();
const emit = defineEmits(['close']);
const userDetails = computed(() => authStore.userDetails);
//const userFirstName = authStore.userDetails?.firstname || 'Guest'
//const userLastName=authStore.userDetails?.lastname || '?'
//const userDepartment = authStore.userDetails?.department || 'N/A'

const products = ref([]);
const departments = ref([]);
const productStocks = ref([]);
const startDate = ref('');
const endDate = ref('');
const selectedDepartment=ref('')
const dispatchLogs = ref([]);
// Fetch products and departments

// Message variables for success/error handling
const message = ref('');
const errorMessage = ref('');


// Sorting state
const sortField = ref('');
const sortOrder = ref('asc'); // 'asc' or 'desc'

// Function to handle sorting
const sortTable = (field) => {
 if (sortField.value === field) {
   // Toggle sort order if the same column is clicked
   sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
 } else {
   // Set new sort field and default to ascending
   sortField.value = field;
   sortOrder.value = 'asc';
 }
};

// Computed property for sorted logs
const sortedLogs = computed(() => {
 return [...dispatchLogs.value].sort((a, b) => {
   let fieldA, fieldB;

   // Handle sorting by productName, departmentName, or date
   if (sortField.value === 'productName') {
     fieldA = getProductName(a.productCode);
     fieldB = getProductName(b.productCode);
   } else if (sortField.value === 'departmentName') {
     fieldA = getDepartmentName(a.department);
     fieldB = getDepartmentName(b.department);
   } else if (sortField.value === 'date') {
     fieldA = new Date(a.date);
     fieldB = new Date(b.date);
   }

   // Compare values for ascending/descending sort
   if (fieldA < fieldB) return sortOrder.value === 'asc' ? -1 : 1;
   if (fieldA > fieldB) return sortOrder.value === 'asc' ? 1 : -1;
   return 0;
 });
});





   
  

    // Function to query departmentCode from departments collection
    const fetchDepartmentCode = async () => {
      try {
        if (department2.value) {
          // Query the 'departments' collection where departmentName matches
          const q = query(
            collection(db, 'departments'),
            where('departmentName', '==', department2.value)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            // Assuming there's only one matching department
            const departmentDoc = querySnapshot.docs[0];
            const departmentData = departmentDoc.data();

            // Populate departCode with the value from Firebase
            departCode.value = departmentData.departmentCode;
            console.log('Department Code:', departCode.value);
          } else {
            console.error('No department found with the provided name');
            departCode.value = ''; // Clear the value if no department is found
          }
        } else {
          console.error('No department name selected');
        }
      } catch (error) {
        console.error('Error fetching department code:', error.message);
      }
    };

 




const formatDateTime = (timestamp) => {
 if (timestamp && timestamp.seconds) {
   const date = new Date(timestamp.seconds * 1000); // Convert Firestore Timestamp to JavaScript Date
   return date.toLocaleString(); // Returns a readable date and time string
 }
 return '';
};

const getProductName = (productCode) => {
 const product = products.value.find(p => p.productCode === productCode);
 return product ? product.productName : productCode;
};

const getDepartmentName = (department) => {
 const depart = departments.value.find(d => d.departmentCode === department);
 return depart ? depart.departmentName : department;
};
// Function to update products in real-time
const updateProducts = (newProducts) => {
 products.value = newProducts;
};

// Function to update departments in real-time
const updateDepartments = (newDepartments) => {
 departments.value = newDepartments;
};


// Get total quantity for a product
const getTotalQty = (productCode) => {
 const productStock = productStocks.value.find(stock => stock.productCode === productCode);
 return productStock ? productStock.totalQty : 0;
};

// Get dispatched amount for a product in a specific department
const getDispatchedAmount = (productCode, departmentCode) => {
 const department = departments.value.find(dept => dept.departmentCode === departmentCode);
 if (!department) return 0;

 const product = department.DispatchedProducts.find(prod => prod.productCode === productCode);
 return product ? product.dispatchedAmount : 0;
};

// Fetch product stock data from Firestore
//const fetchProductStocks = async () => {
// try {
 //  const productStockCollection = collection(db, 'productStock');
 //  const productStockSnap = await getDocs(productStockCollection);
 //  return productStockSnap.docs.map(doc => doc.data());
 //} catch (error) {
//   console.error('Error fetching product stocks:', error);
//   throw error;
// }
//};

// Fetch product stocks in real-time
const fetchProductStocks = () => {
 const productStockRef = collection(db, 'productStock');
 onSnapshot(productStockRef, (snapshot) => {
   productStocks.value = snapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data()
   }));
 });
};

// Fetch dispatch logs based on date range and department
const getDispatchLogs = async () => {
 try {
   await fetchDispatchLogs(startDate, endDate, selectedDepartment, dispatchLogs);
   console.log('Fetched Logs: ', dispatchLogs.value);
 } catch (error) {
   console.error('Error fetching dispatch logs:', error);
 }
};




// Function to handle the delete operation
const handleDelete = async (departmentCode, productCode, dispatchedAmount,dispatchDocId) => {
 // Clear previous messages
 message.value = '';
 errorMessage.value = '';

 try {
   // Call the remove function with the provided values
   await removeDispatchLogAndUpdateStock(departmentCode, productCode, dispatchedAmount, dispatchDocId);

   // Remove the log from the UI (optional, depending on your logic)
   sortedLogs.value = sortedLogs.value.filter(dispatch => dispatch.productCode !== productCode);

   // Set success message
   message.value = 'Successfully removed dispatch and updated stock!';
 } catch (error) {
   // Handle error case
   errorMessage.value = `Error: ${error.message}`;
 }
};





// Reactive references for table data



//import a function to fetch province totalQty
import { fetchProductStockWithQtyPerProvince } from '../../services/fetchstock'; // Adjust path as needed


import Toastify from 'toastify-js'; // Import Toastify for notifications
import 'toastify-js/src/toastify.css';

const productStore = useProductStore();
const selectedProductCode = ref('');
const selectedDepartCode=ref('')
const departs = ref([]);

const isDivVisible = ref(false);

const dialog=ref(false)

// Toggle the dialog visibility
function toggleDialog() {
 dialog.value = !dialog.value;
}







const selectedTab = ref('addData')




//data to create user
 const email = ref('');
 const password = ref('');
 const password2 = ref('');
 const telephone = ref('');
 const firstname = ref('');
 const lastname = ref('');
 const department2 = ref('');
 const departCode=ref('');
 const UserRole=ref('')
//items data
const productCode = ref('');
const totalQty = ref(0);
const productName=ref('')
//shops data
const shopCode = ref('');
const shopName = ref('');
const department = ref('');
const shopExists = ref(false); // Track whether the shop exists

// Get Quasar instance

const pcode = ref('');
const pname = ref('');

import * as XLSX from 'xlsx';
import {  db } from '../../firebase';


const file = ref(null);
const excelData = ref(null);

const fetchdepartment = async () => {
   const querySnapshot = await getDocs(collection(db, "departments"));
   departs.value = querySnapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data()
   }));
 };

const handleFileUpload = (event) => {
  const inputFile = event.target.files[0];
  file.value = inputFile;

  if (file.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Assuming the first sheet is the one you want
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      excelData.value = XLSX.utils.sheet_to_json(worksheet);
    };
    reader.readAsArrayBuffer(file.value);
  }
};

const importData = async () => {
  if (excelData.value) {
    try {
      const batch = writeBatch(db);

      excelData.value.forEach((item) => {
        // Add current timestamp as UpdateDate
        item.dateEntered = serverTimestamp();

        const docRef = doc(db, 'products', item.id || Math.random().toString(36).substr(2, 9));
        batch.set(docRef, item);
      });

      await batch.commit();
      console.log('Data successfully imported to Firebase!');
    } catch (error) {
      console.error('Error importing data to Firebase: ', error);
    }
  } else {
    console.error('No data to import!');
  }
};

function handleProductChange(event) {
 const selectedProductCode = event.target.value;
 const selectedProduct = productStore.products.find(product => product.productCode === selectedProductCode);
 
 if (selectedProduct) {
   // You now have both productCode and productName
   productCode.value = selectedProduct.productCode;
   productName.value = selectedProduct.productName;
   
   console.log('Selected Product Code:', productCode);
   console.log('Selected Product Name:', productName);
   
   // Store or use the productName and productCode as needed
 }
}

async function checkProductExistence(productCode) {
 if (!productCode) {
   return null; // Early return if productCode is not valid
 }

 // Query the collection to find a document where productCode matches
 const productCollectionRef = collection(db, 'productStock');
 const q = query(productCollectionRef, where('productCode', '==', productCode));
 const querySnapshot = await getDocs(q);

 // Return the first document that matches, or null if none found
 return querySnapshot.empty ? null : querySnapshot.docs[0];
}

async function logProductUpdate(productCode, productName, oldQty, newQty) {
 const storesLogRef = collection(db, 'storesLog');
 
 // Add a log entry with product details, quantity change, and timestamp
 await addDoc(storesLogRef, {
   productCode,
   productName,
   oldQty,
   newQty,
   quantityAdded: newQty - oldQty,
   timestamp: new Date().toISOString()
 });
}

async function saveProductStock() {
 try {
   const existingProductDoc = await checkProductExistence(productCode.value);

   if (existingProductDoc) {
     // Product exists, prompt user
     const confirmUpdate = confirm('Product already exists. Do you want to update the quantity?');
     
     if (confirmUpdate) {
       // User chose to update the quantity
       const currentQty = existingProductDoc.data().totalQty || 0;
       const newQty = currentQty + parseInt(totalQty.value);

       // Update the document with the new quantity
       const productDocRef = doc(db, 'productStock', existingProductDoc.id);
       await updateDoc(productDocRef, { totalQty: newQty });

       // Log the update in the storesLog collection
       await logProductUpdate(productCode.value, productName.value, currentQty, newQty);

       alert('Product quantity updated successfully!');
     } else {
       // User chose to cancel
       alert('Operation cancelled.');
     }
   } else {
     // Product does not exist, create a new document
     const result = await storeProductStock(productCode.value, productName.value, totalQty.value);
     alert('Product added successfully!');
   }
 } catch (error) {
   console.error('Error saving product stock:', error);
   alert('Error saving product stock. Please try again.');
 }
}


const checkShopExists = async () => {
 if (!shopCode.value) return;

 // Create a query to check for a document with the specific shopCode
 const q = query(collection(db, 'SHOPS'), where('shopCode', '==', shopCode.value));
 const querySnapshot = await getDocs(q);

 if (!querySnapshot.empty) {
   // If a matching document exists, populate the form and show the update/delete buttons
   const shopData = querySnapshot.docs[0].data(); // Get the first matching document
   shopName.value = shopData.shopName;
   department.value = shopData.department;
   shopExists.value = true;
   alert('Shop already exists. You can update or delete it.');
 } else {
   shopExists.value = false;
 }
};

  // Function to save a new shop
   const saveShop = async () => {
     if (!shopCode.value || !shopName.value || !department.value) {
       alert('Please fill out all fields.');
       return;
     }

     const shopsRef = collection(db, 'SHOPS');
     await addDoc(shopsRef, {
       shopCode: shopCode.value,
       shopName: shopName.value,
       department: department.value,
       createdAt: serverTimestamp(),
     });
     alert('Shop successfully registered.');
     resetForm();
   };

 //update a shop with details
   const updateShop = async () => {
 if (!shopCode.value) return;

 // Query for the document using the shopCode
 const q = query(collection(db, 'SHOPS'), where('shopCode', '==', shopCode.value));
 const querySnapshot = await getDocs(q);

 if (!querySnapshot.empty) {
   // Get the first matching document (since shopCode should be unique)
   const shopDoc = querySnapshot.docs[0];
   const shopRef = doc(db, 'SHOPS', shopDoc.id);

   // Update the document with the new shop details
   await updateDoc(shopRef, {
     shopName: shopName.value,
     department: department.value,
   });
   alert('Shop details updated.');
   resetForm();
 } else {
   alert('Shop not found.');
 }
};


//delete a shop
const deleteShop = async () => {
 if (!shopCode.value) return;

 // Query for the document using the shopCode
 const q = query(collection(db, 'SHOPS'), where('shopCode', '==', shopCode.value));
 const querySnapshot = await getDocs(q);

 if (!querySnapshot.empty) {
   // Get the first matching document
   const shopDoc = querySnapshot.docs[0];
   const shopRef = doc(db, 'SHOPS', shopDoc.id);

   // Delete the document
   await deleteDoc(shopRef);
   alert('Shop deleted.');
   resetForm();
 } else {
   alert('Shop not found.');
 }
};

   // Function to reset the form fields
   const resetForm = () => {
     shopCode.value = '';
     shopName.value = '';
     department.value = '';
     shopExists.value = false;
   };
//function to register new User
const handleSubmit = () => {
 // Check if password and confirm password match
 if (password.value !== password2.value) {
   // Show toast notification for password mismatch
   showToast('Password does not match', 'red');
   return; // Stop form submission
 }

 // If passwords match, proceed with sign-up
 authStore.signUp(email.value, password.value, {
   telephone: telephone.value,
   firstname: firstname.value,
   lastname: lastname.value,
   departmentName: department2.value,
   departmentCode:departCode.value,
   role:UserRole.value
 });
};

onMounted(async () => {
   await fetchdepartment(); // Get all departments
   fetchProducts(updateProducts);   // Listen for real-time product changes
   fetchDepartments(updateDepartments);  // Listen for real-time department changes
   fetchProductStocks()
   getDispatchLogs();
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
const registerDepartment = async () => {
 try {
   // Check if a department with the same code or name exists
   const departmentQuery = query(
     collection(db, 'departments'),
     where('code', '==', pcode.value),
     where('name', '==', pname.value)
   );
   const querySnapshot = await getDocs(departmentQuery);

   if (!querySnapshot.empty) {
     // If department exists, prompt the user
     alert('Department already exists');
   } else {
     // If department does not exist, create a new department with DispatchedProducts array
     await addDoc(collection(db, 'departments'), {
       departmentCode: pcode.value,
       departmentName: pname.value,
       createdAt: serverTimestamp(),
       DispatchedProducts: []  // Add an empty array for dispatch products
     });

     // Notify user of success
     alert('Successfully created');

     // Clear the input fields
     pcode.value = '';
     pname.value = '';
   }
 } catch (error) {
   console.error('Error creating department:', error);
 }
};

// Profile Settings Tab
const userProfile = ref({
  name: 'John Doe',
  email: 'johndoe@example.com'
})

function updateProfile() {
  console.log('Profile updated:', userProfile.value)
  // Logic for updating profile
}
</script>

<style scoped>
 h3 {
   margin-bottom: 16px;
 }

 /* Add your styles here */
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}


 </style>