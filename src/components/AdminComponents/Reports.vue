<template>
    <div  class="flex justify-center items-start">
      <div class="q-pa-md row items-start q-gutter-md">
        <table class="min-w-full border-collapse border border-white">
  <thead>
    <tr>
      <th class="border border-white px-4 py-2 text-left text-white">Report Type</th>
      <th class="border border-white px-4 py-2 text-left text-white">Select Shop</th>
      <th class="border border-white px-4 py-2 text-left text-white">Start Date</th>
      <th class="border border-white px-4 py-2 text-left text-white">End Date</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-transparent">
      <td class="border border-white px-2 py-1"><select v-model="selectedReportType" @change="clearTableData" class="custom-select">
          <option value="dispatchLog">Dispatch Log</option>
          <option value="sales">Sales</option>
          <option value="stockBalance">Stock Balance</option>
          <option value="expiries">Expiries</option>
        </select>
</td>
      <td class="border border-white px-2 py-1"><select v-model="selectedShop" @change="clearTableData" class="custom-select">
          <option value="">All Shops</option>
          <option v-for="shop in shops" :key="shop.shopCode" :value="shop.shopCode">
            {{ shop.shopName }}
          </option>
        </select></td>
      <td class="border border-white px-2 py-1"><input type="date" v-model="startDate" class="custom-date-input" /></td>
      <td class="border border-white px-2 py-1"><input type="date" v-model="endDate" class="custom-date-input" /></td>
    </tr>
  </tbody>
</table>

</div>

    </div>

  
 
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust your Firebase service path

const shops = ref([]);
const selectedReportType = ref('dispatchLog');
const selectedShop = ref('');
const startDate = ref('');
const endDate = ref('');
const reportData = ref([]);
const tableHeaders = ref([]);

onMounted(async () => {
  await fetchShops();
});

// Fetch Shops from Firebase
const fetchShops = async () => {
  const shopCollection = collection(db, 'SHOPS');
  const shopSnapshot = await getDocs(shopCollection);
  shops.value = shopSnapshot.docs.map(doc => doc.data());
};

// Clear Table Data when a new shop or report type is selected
const clearTableData = () => {
  reportData.value = [];
};

// Fetch Report Data
const fetchReport = async () => {
  if (!startDate.value || !endDate.value) {
    alert("Please select a start and end date.");
    return;
  }

  const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
  const endTimestamp = Timestamp.fromDate(new Date(endDate.value));
  const shopQuery = selectedShop.value ? selectedShop.value : ''; // All shops if empty

  switch (selectedReportType.value) {
    case 'dispatchLog':
      await fetchDispatchLog(shopQuery, startTimestamp, endTimestamp);
      break;
    case 'sales':
      await fetchSalesReport(shopQuery, startTimestamp, endTimestamp);
      break;
    case 'stockBalance':
      await fetchStockBalance(shopQuery, startTimestamp, endTimestamp);
      break;
    case 'expiries':
      await fetchExpiriesReport(shopQuery, startTimestamp, endTimestamp);
      break;
  }
};

// Example for fetching dispatch logs
const fetchDispatchLog = async (shopCode, startDate, endDate) => {
  const dispatchCollection = collection(db, 'dispatches');
  let q = query(
    dispatchCollection,
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  if (shopCode) {
    q = query(q, where('selectedShop', '==', shopCode));
  }

  const dispatchSnapshot = await getDocs(q);
  const dispatchData = dispatchSnapshot.docs.map(doc => doc.data());
  
  reportData.value = dispatchData.map((dispatch) => ({
    date: dispatch.date.toDate().toLocaleDateString(),
    shop: dispatch.selectedShop,
    productCode: dispatch.items.map(item => item.productCode).join(', '),
    quantity: dispatch.items.map(item => item.quantity).join(', ')
  }));

  tableHeaders.value = ['Date', 'Shop', 'Product Code(s)', 'Quantity'];
};

// You will implement similar fetch functions for Sales, Stock Balance, and Expiries
</script>

