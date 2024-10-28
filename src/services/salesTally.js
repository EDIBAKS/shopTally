import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { ref } from 'vue';
import { db } from '../firebase'; // Adjust this import according to your Firebase setup
import { useAuthStore } from '../stores/authStore'; // Adjust according to your store setup

// Function to get sales tally for the current month for the logged-in user's shopCode
export async function getSalesTallyForCurrentMonth() {
  const authStore = useAuthStore();
  const shopCode = authStore.userDetails?.shopCode; // Get the logged-in user's shopCode
  const salesTally = ref([]);

  if (!shopCode) {
    console.error('No shopCode available for the current user.');
    return [];
  }
  
  // Get the first and last day of the current month
  const now = new Date();
  const startOfMonth  = new Date(currentYear, 0, 1).toISOString().substr(0, 10);  // January 1st of the current year
  const endOfMonth = new Date(currentYear, 11, 31).toISOString().substr(0, 10); // December 31st of the current year
  
 


  // Convert the dates to Firebase timestamps
  const startTimestamp = Timestamp.fromDate(startOfMonth);
  const endTimestamp = Timestamp.fromDate(endOfMonth); // Include last millisecond of the month

  try {
    // Query the salesTally collection for the current shop and date range
    const salesQuery = query(
      collection(db, 'salesTally'),
      where('shopCode', '==', shopCode),
      where('dateEntered', '>=', startTimestamp),
      where('dateEntered', '<=', endTimestamp)
    );

    // Execute the query and process the documents
    const querySnapshot = await getDocs(salesQuery);

    // Initialize a map to store the total quantity for each productCode
    const productQuantities = {};

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const products = data.products || [];

      products.forEach((product) => {
        const { productCode, productName, quantity } = product;

        // If the product already exists in the map, sum up the quantity, otherwise initialize it
        if (productQuantities[productCode]) {
          productQuantities[productCode].totalQuantity += quantity;
        } else {
          productQuantities[productCode] = {
            productName,
            totalQuantity: quantity,
          };
        }
      });
    });

    // Convert the productQuantities map into an array of objects for easier display
    salesTally.value = Object.keys(productQuantities).map((productCode) => ({
      productCode,
      productName: productQuantities[productCode].productName,
      totalQuantity: productQuantities[productCode].totalQuantity,
    }));

    return salesTally.value;
  } catch (error) {
    console.error('Error fetching sales tally:', error);
    return [];
  }
}
