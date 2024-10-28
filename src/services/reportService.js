// services/reportService.js

import { collection, getDocs, where, Timestamp, query } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming this is where your Firebase is initialized
import { useAuthStore } from '@/stores/authStore';


export const generateReport = async (reportType, shopCode, startDate, endDate) => {
  const authStore = useAuthStore();
  const departmentData = ref([]);
  const departmentCode = authStore.userDetails.departmentCode; // Assuming departmentCode is stored in userDetails
  try {
    const startTimestamp = Timestamp.fromDate(new Date(startDate));
    const endTimestamp = Timestamp.fromDate(new Date(endDate));
  

    if (reportType === 'dispatches') {
      const fetchDispatchedProducts = async () => {
        if (!startDate.value || !endDate.value) {
          console.error('Please select a valid start date and end date');
          return;
        }
      
        try {
          // Convert startDate and endDate to Firebase timestamps
          const startTimestamp = new Date(startDate.value).getTime();
          const endTimestamp = new Date(endDate.value).getTime();
      
          // Reference to the 'departments' collection
          const departmentsRef = collection(db, 'departments');
      
          // Create a query to fetch records that match the departmentCode and date range
          const q = query(
            departmentsRef,
            where('departmentCode', '==', departmentCode),
            where('timestamp', '>=', startTimestamp),
            where('timestamp', '<=', endTimestamp)
          );
      
          // Fetch the query result
          const querySnapshot = await getDocs(q);
      
          // Process the fetched data
          departmentData.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            departmentName: doc.data().departmentName,
            dispatchedProducts: doc.data().DispatchedProducts,
          }));
      
          console.log('Fetched data:', departmentData.value);
        } catch (error) {
          console.error('Error fetching department data:', error);
        }
      };
      
    } else if (reportType === 'daily-tally') {
      // Fetch daily tally data (similar logic here)
    } else if (reportType === 'stock-report') {
      // Fetch stock report data (similar logic here)
    } else if (reportType === 'sales-report') {
      // Fetch sales data
      const salesQuery = query(
        collection(db, 'monthlySales'),
        where('shopCode', '==', shopCode),
        where('UpdateDate', '>=', startTimestamp),
        where('UpdateDate', '<=', endTimestamp)
      );
      const querySnapshot = await getDocs(salesQuery);

      reportData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        product: doc.data().productName,
        quantity: doc.data().quantity,
        date: doc.data().UpdateDate.toDate().toLocaleDateString(),
      }));
    }

    return reportData;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};
