// firebaseService.js

import { db } from '../firebase'; // Adjust the import according to your file structure
import { getFirestore, doc,addDoc, getDoc, updateDoc, setDoc,collection } from 'firebase/firestore';



export async function storeProductStock(productCode, productName, totalQty) {
  const productCollectionRef = collection(db, 'productStock');
  const productDocRef = doc(db, 'productStock', productCode);

  // Check if the product exists
  const docSnap = await getDoc(productDocRef);

  if (docSnap.exists()) {
    // Product exists, update quantity
    await updateDoc(productDocRef, {
      totalQty,
      DateEntered: new Date().toISOString()
    });

    // Log the update operation
    const logRef = doc(db, 'storesLog', `${productCode}_${Date.now()}`);
    await setDoc(logRef, {
      productCode,
      productName,
      quantityAdded: totalQty,
      timestamp: new Date().toISOString()
    });

    return { status: 'updated', message: 'Product quantity updated successfully!' };
  } else {
    // Product does not exist, create new document with auto-generated ID
    const newDocRef = await addDoc(productCollectionRef, {
      productCode,
      productName,
      totalQty,
      DateEntered: new Date().toISOString()
    });

    return { status: 'added', message: 'Product added successfully!', id: newDocRef.id };
  }
}