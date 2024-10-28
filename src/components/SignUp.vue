<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <div class="w-full max-w-md bg-white p-6 rounded-lg ">
      <div class="flex items-center justify-between mb-6">
  <!-- Left side: Dynapharm Congo and logo -->
  <div class="flex items-center">
    <p class="text-3xl mb-0 text-red-600 font-semibold flex-1">Dynapharm Congo</p>
  
  </div>
  <div class="flex">
 <!-- Right side: Stock Management System -->
 <p class="text-lg text-gray-600 font-light">Stock Management System</p>
  <img src="../assets/croplogo.png" width="50px" height="50px" class="ml-4" />
  </div>
 
</div>

      <h1 class="text-3xl font-bold mb-6 text-center">{{ isSignUp ? 'Sign Up' : 'Login' }}</h1>

      <form @submit.prevent="handleSubmit" class="w-full">
        <div v-if="isSignUp">
          <div class="relative z-0 w-full mb-5 group">
            <input v-model="email" type="email" name="floating_email" id="floating_email"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
            <label for="floating_email"
              class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:font-medium peer-focus:left-0 peer-focus:text-blue-600">Email
              address</label>
          </div>

          <div class="relative z-0 w-full mb-5 group">
            <input v-model="password" type="password" name="floating_password" id="floating_password"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
            <label for="floating_password"
              class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:font-medium peer-focus:left-0 peer-focus:text-blue-600">Password</label>
          </div>

          <div class="grid md:grid-cols-2 md:gap-6">
            <div class="relative z-0 w-full mb-5 group">
              <input v-model="firstname" type="text" name="floating_first_name" id="floating_first_name"
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
              <label for="floating_first_name"
                class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:font-medium peer-focus:left-0 peer-focus:text-blue-600">First
                name</label>
            </div>
            <div class="relative z-0 w-full mb-5 group">
              <input v-model="lastname" type="text" name="floating_last_name" id="floating_last_name"
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
              <label for="floating_last_name"
                class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:font-medium peer-focus:left-0 peer-focus:text-blue-600">Last
                name</label>
            </div>
          </div>

          <div class="grid md:grid-cols-2 md:gap-6">
            <div class="relative z-0 w-full mb-5 group">
              <select v-model="department" id="countries"
                class="block w-full py-2.5 px-0 text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 focus:outline-none focus:ring-0 focus:border-blue-600 peer">
                <option selected>Choose a Department</option>
                <option v-for="department in departs" :key="department.code" :value="department.name">{{ department.name }}</option>
              </select>
            </div>
            <div class="relative z-0 w-full mb-5 group">
              <input v-model="telephone" type="tel" name="floating_phone" id="floating_phone"
                class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
              <label for="floating_phone"
                class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:font-medium peer-focus:left-0 peer-focus:text-blue-600">Phone
                number (123-456-7890)</label>
            </div>
          </div>
        </div>

        <div v-else>
          <div class="relative z-0 w-full mb-5 group">
            <input v-model="email" type="email" name="floating_email" id="floating_email"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
            <label for="floating_email"
              class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:font-medium peer-focus:left-0 peer-focus:text-blue-600">Email
              address</label>
          </div>

          <div class="relative z-0 w-full mb-5 group">
            <input v-model="password" type="password" name="floating_password" id="floating_password"
              class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer" placeholder=" " required />
            <label for="floating_password"
              class="absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:font-medium peer-focus:left-0 peer-focus:text-blue-600">Password</label>
          </div>
        </div>

        <p class="text-red-500" v-if="message">{{ message }}</p>

        <button type="submit"
          class="block w-full bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:outline-none focus:ring-4 focus:ring-blue-300">
          {{ isSignUp ? 'Sign Up' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

  <script setup>
  import { ref,onMounted } from 'vue';
  import { useAuthStore } from '../stores/authStore';
  import { collection, getDocs,query,where } from 'firebase/firestore';
  import { db } from '../firebase'; // make sure you have Firebase initialized
  const authStore = useAuthStore();

  import { useRoute } from 'vue-router';

const route = useRoute();
const message = ref(route.query.message || '');  // Get message from query parameters



  const isSignUp = ref(false);
  const email = ref('');
  const password = ref('');
  const telephone = ref('');
  const firstname = ref('');
  const lastname = ref('');
  const department = ref('admin');
  const departs = ref([]);
  const toggleMode = () => {
    isSignUp.value = !isSignUp.value;
  };

  const fetchdepartment = async () => {
    const querySnapshot = await getDocs(collection(db, "departments"));
    departs.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };
  
  const handleSubmit = () => {
    if (isSignUp.value) {
      authStore.signUp(email.value, password.value, { telephone: telephone.value, firstname: firstname.value,lastname: lastname.value, department: department.value });
    } else {
      authStore.logIn(email.value, password.value);
    }
  };


  onMounted(async () => {
    await fetchdepartment(); // Get all departments
  });

  </script>
  