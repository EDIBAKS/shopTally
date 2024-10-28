// stores/salesStore.js
import { defineStore } from 'pinia';
import { db } from '@/firebase'; // Ensure to import your Firebase configuration
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useAuthStore } from './authStore'; // Import the auth store

export const useSalesStore = defineStore('sales', {
  state: () => ({
    allSalesData: [],
    salesSummary:[],
    startDate: null,
    endDate: null,
    selectedFilter: 'thisMonth',
  }),
  actions: {
    async fetchSalesData() {
        const authStore = useAuthStore(); // Access the auth store
        const shopCode = authStore.userDetails.shopCode; // Get the current user's shopCode
        this.setDefaultMonth(); // Set to current month if needed
      
        // Convert startDate and endDate to Firestore Timestamp
        const startTimestamp = Timestamp.fromDate(new Date(this.startDate));
        const endTimestamp = Timestamp.fromDate(new Date(this.endDate));
      
        const q = query(
          collection(db, 'salesTally'),
          where('shopCode', '==', shopCode),
          where('dateEntered', '>=', startTimestamp),
          where('dateEntered', '<=', endTimestamp)
        );
      
        const querySnapshot = await getDocs(q);
        this.allSalesData = querySnapshot.docs.map(doc => doc.data());
      },

    async fetchSales(){
        // Check if date range is provided, otherwise set default month range
        if (!startDate.value || !endDate.value) {
          setDefaultMonth();
        }
      
        // Log the raw start and end date values for debugging
        console.log('Selected Start Date:', startDate.value);
        console.log('Selected End Date:', endDate.value);
      
        // Convert startDate to a timestamp at the start of the day (00:00:00)
        const startTimestamp = Timestamp.fromDate(new Date(startDate.value));
        
        // Convert endDate to a timestamp at the end of the day (23:59:59)
        const endDateObj = new Date(endDate.value);
        endDateObj.setHours(23, 59, 59, 999); // Set the time to 23:59:59.999 for end of the day
        const endTimestamp = Timestamp.fromDate(endDateObj);
      
        // Log the start and end timestamp values for debugging
        console.log('Start Timestamp:', startTimestamp.toDate());
        console.log('End Timestamp:', endTimestamp.toDate());
      
        try {
          // Query to get sales between the selected dates
          const q = query(
            collection(db, 'salesTally'), 
            where('dateEntered', '>=', startTimestamp),
            where('dateEntered', '<=', endTimestamp)
          );
          
          const querySnapshot = await getDocs(q);
      
          // Clear existing data and populate the sales summary
          salesSummary.value = [];
          querySnapshot.forEach((doc) => {
            const salesData = doc.data();
            salesSummary.value.push({
              receiptNo: salesData.receiptNo,
              dateEntered: salesData.dateEntered,
              products: salesData.products, // Assuming products is an array
              total: salesData.total || 0
            });
          });
      
          // Log the fetched sales data for debugging
          console.log('Fetched Sales Summary:', salesSummary.value);
          
        } catch (error) {
          console.error('Error fetching sales data:', error);
        }
      },
      





      setDefaultMonth() {
        const now = new Date();
        this.startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString(); // Start of the month
        this.endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(); // End of the month
      },
    updateDateRange() {
      const now = new Date();

      if (this.selectedFilter === 'today') {
        this.startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        this.endDate = new Date(now.setHours(23, 59, 59, 999)).toISOString();
      } else if (this.selectedFilter === 'thisWeek') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Sunday
        weekStart.setHours(0, 0, 0, 0);
        this.startDate = weekStart.toISOString();

        const weekEnd = new Date(now);
        weekEnd.setDate(weekStart.getDate() + 6); // Saturday
        weekEnd.setHours(23, 59, 59, 999);
        this.endDate = weekEnd.toISOString();
      } else if (this.selectedFilter === 'thisMonth') {
        this.setDefaultMonth(); // Reset to current month
      }
    },
    applyFilters() {
      this.fetchSalesData(); // Call fetchSalesData to refresh data with current filters
    }
  },
});
