<template>
    <div class="max-w-4xl mx-auto p-4">
      <!-- Form container -->
      <div class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Add Product to Order</h2>
  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <!-- Shop Name -->
          <div>
            <label for="shopName" class="block text-sm font-medium text-gray-700">Shop Name</label>
            <select v-model="shopName" id="shopName" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="" disabled>Select Shop</option>
              <option v-for="shop in shops" :key="shop.code" :value="shop.name">{{ shop.name }}</option>
            </select>
          </div>
  
          <!-- Product Code -->
          <div>
            <label for="productCode" class="block text-sm font-medium text-gray-700">Product Code</label>
            <select v-model="productCode" id="productCode" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="" disabled>Select Product</option>
              <option v-for="product in products" :key="product.code" :value="product.code">{{ product.name }}</option>
            </select>
          </div>
  
          <!-- Quantity -->
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700">Quantity</label>
            <input v-model.number="quantity" type="number" id="quantity" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Enter quantity" />
          </div>
        </div>
  
        <!-- Add button -->
        <button @click="addProductToOrder" class="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-500 focus:outline-none">
          Add Product
        </button>
      </div>
  
      <!-- Product list -->
      <div v-if="order.length > 0" class="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
        <ul class="space-y-2">
          <li v-for="(item, index) in order" :key="index" class="border-b pb-2">
            <span class="font-semibold">{{ item.productCode }}</span> - {{ item.quantity }} pcs
            <button @click="removeProduct(index)" class="text-red-600 ml-2">Remove</button>
          </li>
        </ul>
      </div>
  
      <!-- Save button -->
      <button @click="saveOrder" class="bg-green-600 text-white px-6 py-2 rounded-md shadow hover:bg-green-500 focus:outline-none">
        Save Order
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { collection, addDoc } from 'firebase/firestore';
  import {db} from '../../firebase'
  
  const shopName = ref('');
  const productCode = ref('');
  const quantity = ref(1);
  const order = ref([]);
  
  // Sample shop and product data
  const shops = [
    { name: 'Shop A', code: 'A' },
    { name: 'Shop B', code: 'B' },
  ];
  
  const products = [
    { name: 'Product X', code: 'X' },
    { name: 'Product Y', code: 'Y' },
  ];
  
  // Add product to order
  const addProductToOrder = () => {
    if (shopName.value && productCode.value && quantity.value > 0) {
      order.value.push({
        shopName: shopName.value,
        productCode: productCode.value,
        quantity: quantity.value,
      });
      productCode.value = '';
      quantity.value = 1;
    }
  };
  
  // Remove product from order
  const removeProduct = (index) => {
    order.value.splice(index, 1);
  };
  
  // Save order to Firebase
  const saveOrder = async () => {
    if (shopName.value && order.value.length > 0) {
      try {
        await addDoc(collection(db, 'shopSales'), {
          shopName: shopName.value,
          products: order.value,
          date: new Date(),
        });
        alert('Order saved successfully!');
        // Reset form and order
        order.value = [];
        shopName.value = '';
      } catch (error) {
        console.error('Error saving order: ', error);
      }
    } else {
      alert('Please select a shop and add products.');
    }
  };
  </script>
  
  <!-- Tailwind CSS styling (using grid for responsive design) -->
  <style scoped>
  @import "https://cdn.jsdelivr.net/npm/tailwindcss@2.0.1/dist/tailwind.min.css";
  </style>
  