import { doc, getDoc, updateDoc, collection, query, where, getDocs, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust this based on your Firebase configuration
//import { useAuthStore } from '../stores/authStore'; // Assuming authStore is imported like this

export async function dispatchtoShop2(form) {
  try {
    if (!form.departName || !form.departCode) {
      throw new Error('Department name or code is missing');
    }
    //const authStore = useAuthStore();
   // const departmentCode=authStore.userDetails.departmentCode
   // const departmentName = authStore.userDetails.departmentName

    // Query the shopSupply collection by shop code to find the document
    const departmentQuery = query(
      collection(db, 'shopSupply'),
      where('shopCode', '==', form.shopCode)
    );
    const departmentQuerySnap = await getDocs(departmentQuery);

    let departmentDocRef;
    let departmentData;
    if (departmentQuerySnap.empty) {
      // If department doesn't exist, create it
      departmentDocRef = doc(collection(db, 'shopSupply'));
      departmentData = {
        shopCode: form.shopCode,
        shopName: form.shopName,
        departmentCode:form.departCode,
        departmentName:form.departName,
        DispatchedProducts: [],
        date: form.date,
        Status: form.Status,
      };
      await setDoc(departmentDocRef, departmentData);
    } else {
      // Get the existing department document
      const departmentDoc = departmentQuerySnap.docs[0];
      departmentDocRef = departmentDoc.ref;
      departmentData = departmentDoc.data();
    }

    let dispatchedProducts = departmentData.DispatchedProducts || [];

    // Loop through the products array and update the shopSupply first
    for (const product of form.products) {
      const { productCode, dispAmount } = product;
      const dispatchedAmount = Number(dispAmount);

      // Check if product already exists in the DispatchedProducts array
      const existingProductIndex = dispatchedProducts.findIndex(p => p.productCode === productCode);

      if (existingProductIndex !== -1) {
        // Product exists, increment dispatchedAmount
        dispatchedProducts[existingProductIndex].dispatchedAmount =
          Number(dispatchedProducts[existingProductIndex].dispatchedAmount) + dispatchedAmount;
      } else {
        // Product does not exist, add new product
        dispatchedProducts.push({
          productCode,
          dispatchedAmount,
        });
      }
    }

    // Update shopSupply document with the new DispatchedProducts array
    await updateDoc(departmentDocRef, {
      DispatchedProducts: dispatchedProducts,
      Status: form.Status,
      date: form.date,
    });

    // Log the dispatch operation in shopLogs
    for (const product of form.products) {
      const { productCode, dispAmount } = product;
      const dispatchedAmount = Number(dispAmount);
      const logDocRef = doc(db, 'shopLogs', `${productCode}_${form.date.toMillis()}`);
      await setDoc(logDocRef, {
        productCode,
        dispatchedAmount,
        department: form.departCode,
        date: form.date,
        Status: form.Status,
        // Add other relevant details if necessary
      });
    }


  // Log the entire dispatch to shopSupplyLog
  const shopSupplyLogData = {
    shopCode: form.shopCode,
    shopName: form.shopName,
    departmentCode: form.departCode,
    departmentName: form.departName,
    dispatchedProducts,  // Include all products in the log
    date: form.date,
    Status: form.Status,
  };
  const shopSupplyLogRef = doc(collection(db, 'shopSupplyLog')); // Creates a new document with auto-generated ID
  await setDoc(shopSupplyLogRef, shopSupplyLogData);



    // Now, update the departments collection
    const departmentsQuery = query(
      collection(db, 'departments'),
      where('departmentCode', '==', form.departCode)
    );
    const departmentsQuerySnap = await getDocs(departmentsQuery);

    if (!departmentsQuerySnap.empty) {
      // Get the existing department document
      const departmentDoc = departmentsQuerySnap.docs[0];
      const departmentDocRef = departmentDoc.ref;
      const departmentData = departmentDoc.data();
      let departmentDispatchedProducts = departmentData.DispatchedProducts || [];

      // Loop through the products and subtract the dispatched amounts
      for (const product of form.products) {
        const { productCode, dispAmount } = product;
        const dispatchedAmount = Number(dispAmount);

        const existingProductIndex = departmentDispatchedProducts.findIndex(p => p.productCode === productCode);

        if (existingProductIndex !== -1) {
          // Subtract the dispatchedAmount from the existing product's dispatchedAmount
          departmentDispatchedProducts[existingProductIndex].dispatchedAmount -= dispatchedAmount;

          // Ensure dispatchedAmount doesn't drop below zero
          if (departmentDispatchedProducts[existingProductIndex].dispatchedAmount < 0) {
            departmentDispatchedProducts[existingProductIndex].dispatchedAmount = 0;
          }
        }
      }

      // Update the departments document with the modified DispatchedProducts array
      await updateDoc(departmentDocRef, {
        DispatchedProducts: departmentDispatchedProducts,
        date: form.date, // Update the dispatch date
      });

      console.log('Dispatched amounts successfully updated in departments collection.');
    } else {
      console.log('No matching department found for the provided departmentCode.');
    }

    console.log('Dispatch successfully processed for all products');
  } catch (error) {
    console.error('Error processing dispatch:', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}
export async function dispatchtoShop(form) {
  try {
    if (!form.departName || !form.departCode) {
      throw new Error('Department name or code is missing');
    }

    // Query the shopSupply collection by shop code to find the document
    const departmentQuery = query(
      collection(db, 'shopSupply'),
      where('shopCode', '==', form.shopCode)
    );
    const departmentQuerySnap = await getDocs(departmentQuery);

    let departmentDocRef;
    let departmentData;
    if (departmentQuerySnap.empty) {
      // If department doesn't exist, create it
      departmentDocRef = doc(collection(db, 'shopSupply'));
      departmentData = {
        shopCode: form.shopCode,
        shopName: form.shopName,
        departmentCode: form.departCode,
        departmentName: form.departName,
        DispatchedProducts: [], // Initialize empty array
        date: form.date,
        Status: form.Status,
      };
      await setDoc(departmentDocRef, departmentData);
    } else {
      // Get the existing department document
      const departmentDoc = departmentQuerySnap.docs[0];
      departmentDocRef = departmentDoc.ref;
      departmentData = departmentDoc.data();
    }

    let dispatchedProducts = departmentData.DispatchedProducts || [];

    // Loop through the products array and update the shopSupply first
    for (const product of form.products) {
      const { productCode, dispAmount } = product;
      const dispatchedAmount = Number(dispAmount);

      // Check if product already exists in the DispatchedProducts array
      const existingProductIndex = dispatchedProducts.findIndex(p => p.productCode === productCode);

      if (existingProductIndex !== -1) {
        // Product exists, increment dispatchedAmount
        dispatchedProducts[existingProductIndex].dispatchedAmount =
          Number(dispatchedProducts[existingProductIndex].dispatchedAmount) + dispatchedAmount;
      } else {
        // Product does not exist, add new product
        dispatchedProducts.push({
          productCode,
          dispatchedAmount,
        });
      }
    }

    // Update shopSupply document with the new DispatchedProducts array
    await updateDoc(departmentDocRef, {
      DispatchedProducts: dispatchedProducts,
      Status: form.Status,
      date: form.date,
    });

    // Log the dispatch operation in shopLogs
    //for (const product of form.products) {
      //const { productCode, dispAmount } = product;
     // const dispatchedAmount = Number(dispAmount);
      //const logDocRef = doc(db, 'shopLogs', `${productCode}_${form.date.toMillis()}`);
     // await setDoc(logDocRef, {
      //  productCode,
      //  dispatchedAmount,
       // department: form.departCode,
       // shopCode: form.shopCode,
       // shopName: form.shopName,
       // date: form.date,
       // Status: form.Status,
        // Add other relevant details if necessary
     // });
  //  }

  // Log the dispatch operation in shopLogs
for (const product of form.products) {
  const { productCode, dispAmount } = product;
  const dispatchedAmount = Number(dispAmount);

  await addDoc(collection(db, 'shopLogs'), {
    productCode,
    dispatchedAmount,
    department: form.departCode,
    shopCode: form.shopCode,
    shopName: form.shopName,
    date: form.date,
    Status: form.Status,
    // Add other relevant details if necessary
  });
}


    // Log the entire dispatch to shopSupplyLog as a NEW document each time
    const shopSupplyLogData = {
      shopCode: form.shopCode,
      shopName: form.shopName,
      departmentCode: form.departCode,
      departmentName: form.departName,
      dispatchedProducts: [...form.products],  // Log the products being dispatched
      date: form.date,
      Status: form.Status,
    };
    await addDoc(collection(db, 'shopSupplyLog'), shopSupplyLogData); // Add new document with auto-generated ID

    // Now, update the departments collection
    const departmentsQuery = query(
      collection(db, 'departments'),
      where('departmentCode', '==', form.departCode)
    );
    const departmentsQuerySnap = await getDocs(departmentsQuery);

    if (!departmentsQuerySnap.empty) {
      // Get the existing department document
      const departmentDoc = departmentsQuerySnap.docs[0];
      const departmentDocRef = departmentDoc.ref;
      const departmentData = departmentDoc.data();
      let departmentDispatchedProducts = departmentData.DispatchedProducts || [];

      // Loop through the products and subtract the dispatched amounts
      for (const product of form.products) {
        const { productCode, dispAmount } = product;
        const dispatchedAmount = Number(dispAmount);

        const existingProductIndex = departmentDispatchedProducts.findIndex(p => p.productCode === productCode);

        if (existingProductIndex !== -1) {
          // Subtract the dispatchedAmount from the existing product's dispatchedAmount
          departmentDispatchedProducts[existingProductIndex].dispatchedAmount -= dispatchedAmount;

          // Ensure dispatchedAmount doesn't drop below zero
          if (departmentDispatchedProducts[existingProductIndex].dispatchedAmount < 0) {
            departmentDispatchedProducts[existingProductIndex].dispatchedAmount = 0;
          }
        }
      }

      // Update the departments document with the modified DispatchedProducts array
      await updateDoc(departmentDocRef, {
        DispatchedProducts: departmentDispatchedProducts,
        date: form.date, // Update the dispatch date
      });

      console.log('Dispatched amounts successfully updated in departments collection.');
    } else {
      console.log('No matching department found for the provided departmentCode.');
    }

    console.log('Dispatch successfully processed for all products');
  } catch (error) {
    console.error('Error processing dispatch:', error.message);
    throw error; // Re-throw the error to be handled by the caller
  }
}
