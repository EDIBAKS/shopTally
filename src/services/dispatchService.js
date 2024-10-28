import { collection, doc, getDocs, query, where, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firebase instance

// Function to store department dispatch and update product stock
export async function storeDepartmentDispatch(formData) {
  const { departCode, departName, products, Status } = formData;
  const departmentDispatchRef = collection(db, 'DepartmentsDispatch');
  const productStockRef = collection(db, 'productStock');

  try {
    // Check if department document already exists in DepartmentsDispatch
    const departmentQuery = query(departmentDispatchRef, where('departmentCode', '==', departCode));
    const departmentSnapshot = await getDocs(departmentQuery);
    let departmentDocId = null;
    let existingProducts = [];

    if (!departmentSnapshot.empty) {
      // If document exists, get the document ID and existing products
      departmentSnapshot.forEach(docSnapshot => {
        departmentDocId = docSnapshot.id;
        existingProducts = docSnapshot.data().products || [];
      });
    }

    // This array will hold a summary of the changes to be logged
    let logSummary = [];

    // Iterate over the products array
    for (const product of products) {
      const { productCode, dispAmount } = product;

      // Fetch product from productStock collection
      const productQuery = query(productStockRef, where('productCode', '==', productCode));
      const productSnapshot = await getDocs(productQuery);

      if (!productSnapshot.empty) {
        for (const docSnapshot of productSnapshot.docs) {
          const productData = docSnapshot.data();
          const newTotalQty = productData.totalQty - Number(dispAmount); // Ensure dispAmount is treated as a number

          if (newTotalQty < 0) {
            throw new Error(`Insufficient stock for product ${productData.productName}`);
          }

          // Update totalQty in productStock
          await updateDoc(doc(productStockRef, docSnapshot.id), {
            totalQty: newTotalQty,
          });

          // Check if the product already exists in the department's products array
          const existingProductIndex = existingProducts.findIndex(p => p.productCode === productCode);

          if (existingProductIndex !== -1) {
            // Update dispatchedAmount by summing with the new dispatch amount
            existingProducts[existingProductIndex].dispatchedAmount = 
              Number(existingProducts[existingProductIndex].dispatchedAmount || 0) + Number(dispAmount);
            existingProducts[existingProductIndex].totalStock = newTotalQty;
          } else {
            // Add new product to the products array
            existingProducts.push({
              productCode,
              totalStock: newTotalQty,
              dispatchedAmount: Number(dispAmount), // Ensure the dispatched amount is stored as a number
            });
          }

          // Add product change to the log summary
          logSummary.push({
            productCode,
            action: existingProductIndex !== -1 ? 'Updated' : 'Created',
            dispatchedAmount: Number(dispAmount),
            newTotalQty,
          });
        }
      } else {
        throw new Error(`Product ${productCode} not found in productStock`);
      }
    }

    // Update or create the department document with the updated products array
    if (departmentDocId) {
      // Update existing department document
      await updateDoc(doc(departmentDispatchRef, departmentDocId), {
        products: existingProducts,
        dateEntered: Timestamp.now(),
      });
    } else {
      // Create a new department document if it doesn't exist
      const newDepartmentData = {
        departmentCode: departCode,
        departmentName: departName,
        dateEntered: Timestamp.now(),
        status: Status,
        products: existingProducts,
      };
      await addDoc(departmentDispatchRef, newDepartmentData);
    }

    // Log the operation in a single document for the entire dispatch
    const departmentLogRef = collection(db, departName); // Collection named after the department
    await addDoc(departmentLogRef, {
      departmentCode: departCode,
      action: 'Dispatch',
      products: logSummary, // Log the summary of product changes
      timestamp: Timestamp.now(),
    });

    console.log('Dispatch and product stock updated successfully!');
  } catch (error) {
    console.error('Error storing dispatch or updating product stock:', error);
    throw error;
  }
}
