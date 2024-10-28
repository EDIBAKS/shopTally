import { doc, getDoc, updateDoc, increment, collection, query, where, getDocs, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust this based on your Firebase configuration

// Function to handle dispatch logic and logging
export async function dispatchProducts(form) {
  try {
    // Ensure form.departName and form.departCode are valid
    if (!form.departName || !form.departCode) {
      throw new Error('Department name or code is missing');
    }

    console.log('Department Code:', form.departCode);
    console.log('Department Name:', form.departName);

    // Query the department collection by code to find the document
    const departmentQuery = query(
      collection(db, 'departments'),
      where('departmentCode', '==', form.departCode)
    );
    const departmentQuerySnap = await getDocs(departmentQuery);

    if (departmentQuerySnap.empty) {
      throw new Error(`Department with code ${form.departCode} does not exist`);
    }

    // Assuming there's only one department document for the code
    const departmentDoc = departmentQuerySnap.docs[0];
    const departmentDocRef = departmentDoc.ref;
    const departmentData = departmentDoc.data();

    // Get or initialize the DispatchedProducts array
    let dispatchedProducts = departmentData.DispatchedProducts || [];

    // Loop through each product in the products array
    for (const product of form.products) {
      const { productCode, dispAmount } = product;

      // Ensure dispAmount is treated as a number
      const dispatchedAmount = Number(dispAmount);

      // Check if the product already exists in the DispatchedProducts array
      const existingProductIndex = dispatchedProducts.findIndex(p => p.productCode === productCode);

      if (existingProductIndex !== -1) {
        // If product exists, update the dispatchedAmount
        dispatchedProducts[existingProductIndex].dispatchedAmount = Number(dispatchedProducts[existingProductIndex].dispatchedAmount) + dispatchedAmount;
      } else {
        // If product does not exist, add a new entry to the array
        dispatchedProducts.push({
          productCode,
          dispatchedAmount: dispatchedAmount,
        });
      }

      // Update the department document with the new DispatchedProducts array
      await updateDoc(departmentDocRef, {
        DispatchedProducts: dispatchedProducts,
        Status: form.Status,
        date: form.date,
      });

      // Query the productStock collection to find the document with the matching productCode
      const productStockQuery = query(
        collection(db, 'productStock'),
        where('productCode', '==', productCode)
      );
      const productStockQuerySnap = await getDocs(productStockQuery);

      if (productStockQuerySnap.empty) {
        throw new Error(`Product ${productCode} does not exist in stock`);
      }

      // Assuming productStockQuerySnap has only one document
      const productStockDoc = productStockQuerySnap.docs[0];
      const productData = productStockDoc.data();

      // Ensure there's enough stock to reduce
      if (productData.totalQty >= dispatchedAmount) {
        await updateDoc(productStockDoc.ref, {
          totalQty: increment(-dispatchedAmount),
        });
      } else {
        throw new Error(`Not enough stock for product ${productCode}`);
      }

      // Log the dispatch operation
      const logDocRef = doc(db, 'DepartmentsDispatch', `${productCode}_${form.date.toMillis()}`);
      await setDoc(logDocRef, {
        productCode: productCode,
        dispatchedAmount: dispatchedAmount,
        department: form.departCode,
        date: form.date,
        Status: form.Status,
        // Add other relevant details as needed
      });
    }

    console.log('Dispatch successfully processed for all products');
  } catch (error) {
    console.error('Error processing dispatch:', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}
