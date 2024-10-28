import { collection, query, where, getDocs,Timestamp, arrayUnion, arrayRemove, deleteDoc,updateDoc,doc,getDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Ensure to import your Firebase db instance

export const fetchDepartmentsDispatch = async (startDate, endDate, departmentCode = '') => {
  try {
    const departmentsDispatchRef = collection(db, 'DepartmentsDispatch');
    
    // Create a query with date filters and optional department filter
    let q = query(
      departmentsDispatchRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );
    
    // If a departmentCode is provided, add a filter for it
    if (departmentCode) {
      q = query(
        departmentsDispatchRef,
        where('departmentCode', '==', departmentCode),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
    }
    
    // Fetch the dispatches that match the query
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error('Error fetching DepartmentsDispatch:', error);
    throw error;
  }
};

export const fetchDispatchLogs = async (startDate, endDate, selectedDepartment, dispatchLogs) => {
    const now = new Date();
    let startTimestamp, endTimestamp;
  
    // Extract the raw values from the refs
    const startDateValue = startDate.value ? new Date(startDate.value) : null;
    const endDateValue = endDate.value ? new Date(endDate.value) : null;
  
    // Convert JavaScript Dates to Firestore Timestamps
    if (!startDateValue || !endDateValue) {
      // Default to current month if dates are not provided
      startTimestamp = Timestamp.fromDate(new Date(now.getFullYear(), now.getMonth(), 1));
      endTimestamp = Timestamp.fromDate(now);
    } else {
      startTimestamp = Timestamp.fromDate(startDateValue);
      endTimestamp = Timestamp.fromDate(endDateValue);
    }
  
    // Query Firestore dispatch logs based on the date range and (optionally) department
    const conditions = [
      where('date', '>=', startTimestamp),
      where('date', '<=', endTimestamp),
    ];
  
    if (selectedDepartment && selectedDepartment.value) {
      // Add the department filter if a department is selected
      conditions.push(where('department', '==', selectedDepartment.value));
    }
  
    const dispatchLogQuery = query(
      collection(db, 'DepartmentsDispatch'),
      ...conditions // Spread the conditions array
    );
  
    try {
      const querySnapshot = await getDocs(dispatchLogQuery);
      dispatchLogs.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error('Error fetching dispatch logs:', error);
    }
  };


  export const removeDispatchLogAndUpdateStock = async (departmentCode, productCode, removeAmount, dispatchDocId) => {
    try {
      // Fetch the document by departmentCode
      const departmentsDispatchRef = collection(db, 'departments');
      const q = query(departmentsDispatchRef, where('departmentCode', '==', departmentCode));
      
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        throw new Error(`No dispatch found for departmentCode: ${departmentCode}`);
      }
  
      // Get the first document
      const departmentDoc = querySnapshot.docs[0];
      const departmentData = departmentDoc.data();
      const dispatchedProducts = departmentData.DispatchedProducts || [];
  
      // Find the product in the DispatchedProducts array
      const productIndex = dispatchedProducts.findIndex(product => product.productCode === productCode);
  
      if (productIndex === -1) {
        throw new Error(`Product with code ${productCode} not found in dispatched products.`);
      }
  
      // Subtract the amount from dispatchedAmount
      const updatedDispatchedAmount = dispatchedProducts[productIndex].dispatchedAmount - removeAmount;
      if (updatedDispatchedAmount < 0) {
        throw new Error('Dispatched amount cannot be negative.');
      }
  
      // Update the DispatchedProducts array
      if (updatedDispatchedAmount === 0) {
        // If the dispatched amount becomes 0, remove the product from the array
        dispatchedProducts.splice(productIndex, 1);
      } else {
        // Otherwise, update the dispatchedAmount for that product
        dispatchedProducts[productIndex].dispatchedAmount = updatedDispatchedAmount;
      }
  
      // Update the DepartmentsDispatch document
      await updateDoc(departmentDoc.ref, {
        DispatchedProducts: dispatchedProducts,
      });
  
      // Query productStock collection to find the product by productCode
      const productStockQuery = query(
        collection(db, 'productStock'),
        where('productCode', '==', productCode)
      );
  
      const productStockSnapshot = await getDocs(productStockQuery);
      if (productStockSnapshot.empty) {
        throw new Error(`Product with code ${productCode} not found in product stock.`);
      }
  
      // Get a reference to the first matching document
      const productStockRef = productStockSnapshot.docs[0].ref;
      const currentTotalQty = productStockSnapshot.docs[0].data().totalQty;
      const updatedTotalQty = currentTotalQty + removeAmount;
  
      await updateDoc(productStockRef, {
        totalQty: updatedTotalQty,
      });
  
      // Call DeleteDispatchLog after updating the product stock
      await deleteDispatchLog(dispatchDocId);
  
      // Ensure the department document is NOT deleted even if DispatchedProducts array is empty
      if (dispatchedProducts.length === 0) {
        // If no products remain, update the DispatchedProducts to an empty array
        await updateDoc(departmentDoc.ref, {
          DispatchedProducts: [],
        });
      }
  
      console.log(`Successfully updated the stock and removed ${removeAmount} from dispatched amount.`);
      
    } catch (error) {
      console.error('Error updating stock and removing dispatch log:', error);
      throw error;
    }
  };
  

  export const deleteDispatchLog = async (logId) => {
    try {
      const logRef = doc(db, 'DepartmentsDispatch', logId);
      await deleteDoc(logRef);
      console.log(`Successfully deleted dispatch log with ID: ${logId}`);
    } catch (error) {
      console.error('Error deleting dispatch log:', error);
      throw error;
    }
  };
  