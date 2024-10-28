<template>
  <q-layout view="hHh lpR fFf" class="bg-gray-700">
    <!-- Header -->
    <q-header  class="w-full">
    <q-toolbar class="menu-toolbar">
        <div @click="toggleSidebar" class="cursor-pointer">
           <q-btn flat round dense class="menu-btn">
       <q-icon name="apps" size="md" />
     </q-btn>{{leftDrawerOpen ? 'Hide Menu' : 'Show Menu'}}
         </div>
            <div @click="toggleStats" class="cursor-pointer">
       <q-btn flat round dense class="menu-btn">
       <q-icon name="trending_up" size="md" />
     </q-btn><span>{{isStat ? 'Hide Statistics' : 'Show Statistics'}}</span>
     </div>
     <div @click="toggleDiv" class="cursor-pointer">
      <q-btn flat round dense class="menu-btn">
       <q-icon :name="authStore.isDivVisible ? 'keyboard_arrow_down' : 'keyboard_arrow_up'" size="35px" />
     </q-btn>{{authStore.isDivVisible ? 'Hide Data Form' : 'Show Data Form'}}
     </div>
    <div @click="toggleDialog" class="cursor-pointer">
      <q-btn flat round dense class="menu-btn">
       <q-icon name="local_shipping" size="sm" />
     </q-btn><span>Departments Dispatch</span>
    </div>
     <div>
      <q-btn @click="handleLogout" flat round dense class="menu-btn">
       <q-icon name="account_circle" size="md" />
     </q-btn>Sign Out
     </div>
    
   </q-toolbar>
    
     
   
    </q-header>
    
  
  
<!-- Main Content with Drawer Below the Header -->
<q-page-container>
<div class="popup-container">
  <storeSupply
  
  :dialogVisibility="dialog" 
   @close="handleClose"
/>
</div>
  
  <div class="flex justify-between items-start w-full">
 


 

  <!-- Right Column: Username -->
  <div class="text-right">
    <p>{{ username }}</p>
  </div>
</div>
  <div  class="flex flex-col justify-center items-center">

   <div v-if="isStat">
    <StatsCards/>
   </div>
     
     
    </div>
 
      <!-- Drawer below the header -->
      <q-drawer 
      v-model="leftDrawerOpen"
  show-if-above 
  side="left" 
  bordered 
  class="drawer-below-header custom-drawer text-white"
  @click-outside="closeSidebar"
      
       >
        <q-list>
          <div v-if="userDetails" class="ml-3 text-md font-light">

  
           
  <span style="display: block">{{ userDetails?.firstname || 'Guest'}} {{ userDetails?.firstname || '!'}}</span>
  
  <span style="display: block">{{ currentDateTime }}</span>
</div>
<q-separator class="bg-white"/>    
          <q-item clickable v-ripple  to="/admin-panel" exact>
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section v-if="leftDrawerOpen">
              Home
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin-panel/reports" class="text-white">
            <q-item-section avatar>
              <q-icon name="assessment" />
            </q-item-section>
            <q-item-section v-if="leftDrawerOpen" >
              Reports
            </q-item-section>
          </q-item>
         
          <q-item clickable v-ripple to="/admin-panel/reports" class="text-white">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section v-if="leftDrawerOpen">
              Account Settings
            </q-item-section>
          </q-item>
          <!-- Add more navigation items here -->
        </q-list>
      </q-drawer>

      <!-- Router View for Dynamic Routes -->
      <q-page class="content-container">
        <router-view />
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref,onMounted,computed } from 'vue'
import StatsCards from '../components/StatsCards.vue';
import toolBar from '@/components/toolBar.vue';
import { useAuthStore } from '../stores/authStore';
import storeSupply from '../components/storeSupply.vue'
const authStore=useAuthStore()
const leftDrawerOpen = ref(false)
const currentDateTime = ref('');
const isStat=ref(true)
const userDetails = computed(() => authStore.userDetails);
//const userFirstName = authStore.userDetails?.firstname || 'Guest'
//const userLastName=authStore.userDetails?.lastname || '?'
//const userDepartment = authStore.userDetails?.departmentName || 'N/A'
//const userDepartCode = authStore.userDetails?.departmentCode || 'N/A'
const dialog=ref(false)

// Toggle the dialog visibility
function toggleDialog() {
 dialog.value = !dialog.value;
}
// Handle the close event emitted from the child component
function handleClose() {
 dialog.value = false;  // Close the dialog when 'close' is emitted
}
const toggleDiv = () => {
  authStore.toggleDivVisibility();
};
// Function to toggle sidebar open/close
const toggleSidebar = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Function to close the sidebar when clicking outside
const closeSidebar = () => {
  leftDrawerOpen.value = false
}


// Function to handle logout
const handleLogout = async () => {
  try {
    authStore.logOut(); // Call the logOut function from the auth store
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
// Function to get the current date and time
const updateDateTime = () => {
  const now = new Date();
  const formattedDateTime = now.toLocaleString(); // Format as per your preference
  currentDateTime.value = formattedDateTime;
};

onMounted(() => {
 
 updateDateTime();
 // Optionally, you can update the time every second
 setInterval(updateDateTime, 1000); // Update every second
});

const toggleStats = () => {
 isStat.value = !isStat.value;
};

</script>

<style lang="scss">
.drawer-below-header {
  top: 64px; /* Adjust to match the height of the header */
  height: calc(100vh - 64px); /* Full height minus header height */
}

/* Responsive adjustment for mobile screens */
@media (max-width: 600px) {
  .drawer-below-header {
    top: 56px; /* Adjust for smaller headers on mobile */
    height: calc(100vh - 56px); /* Full height minus mobile header height */
  }

  .q-drawer__content {
    width: 56px !important; /* Collapsed sidebar width */
  }
}

.content-container {
  padding: 16px;
}

.menu-toolbar {
  background-color: #607D8B; /* Slate Gray */
  padding: 10px;
  display: flex;
  justify-content: space-between; /* Space items between, with first at left and last at right */
  margin-top: 3px;
  width: 100%;
}

.menu-btn {
  color: white; /* Icon and button color */
  margin: 0 10px; /* Space between icons */
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.1); /* Hover effect */
}

.menu-toolbar .q-icon {
  font-size: 24px;
}

.custom-drawer {
  background-color: #607D8B; /* Slate Gray */
}

.popup-container {
  padding-top: 25px; /* Adds padding below the header */
}


</style>
