import { collection, getDocs } from "firebase/firestore"; // Ensure this is properly imported
import { db } from "../firebase"; // Adjust this based on your Firebase configuration

// Function to get all products and totalQty from each province
export const fetchProductStockWithQtyPerProvince = async () => {
  try {
    // Step 1: Fetch all products from productStock
    const productStockSnapshot = await getDocs(collection(db, "productStock"));
    const products = productStockSnapshot.docs.map((doc) => ({
      productCode: doc.data().productCode,
      productName: doc.data().productName,
    }));

    // Step 2: Initialize the result array
    const productData = [];

    // Step 3: Define the province collections
    const provinces = ["Katanga", "PointeNoire", "Goma", "Brazzaville", "Kinshasa"];

    // Step 4: Loop through each product and fetch the totalQty from each province
    for (const product of products) {
      const productRow = {
        productCode: product.productCode,
        productName: product.productName,
        provinceData: {},
      };

      // Fetch totalQty for each province collection
      for (const province of provinces) {
        const provinceSnapshot = await getDocs(collection(db, province));
        const provinceData = provinceSnapshot.docs.find(
          (doc) => doc.data().productCode === product.productCode
        );

        // Add totalQty of the product for the province (if exists)
        productRow.provinceData[province] = provinceData
          ? provinceData.data().totalQty
          : 0; // Default to 0 if the product does not exist in this province
      }

      // Add the product data row to the result array
      productData.push(productRow);
    }

    return productData; // This will return an array of objects with product and province data
  } catch (error) {
    console.error("Error fetching product data: ", error);
    return [];
  }
};
