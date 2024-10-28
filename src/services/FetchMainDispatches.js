import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust this based on your Firebase configuration

// Real-time fetch for products from productStock
export const fetchProducts = (callback) => {
  try {
    const productStockCollection = collection(db, 'productStock');
    
    // Listen for real-time updates in productStock
    onSnapshot(productStockCollection, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Pass the data to the callback function
      callback(products);
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Real-time fetch for departments
export const fetchDepartments = (callback) => {
  try {
    const departmentsCollection = collection(db, 'departments');
    
    // Listen for real-time updates in departments
    onSnapshot(departmentsCollection, (snapshot) => {
      const departments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Pass the data to the callback function
      callback(departments);
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
};
