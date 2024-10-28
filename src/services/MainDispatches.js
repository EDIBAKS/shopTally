import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path as needed

export const fetchProductStock = async () => {
  const productStockCollection = collection(db, 'productStock');
  const productStockSnapshot = await getDocs(productStockCollection);
  return productStockSnapshot.docs.map(doc => doc.data());
};

export const fetchDepartments = async () => {
  const departmentsCollection = collection(db, 'departments');
  const departmentsSnapshot = await getDocs(departmentsCollection);
  return departmentsSnapshot.docs.map(doc => doc.data());
};

export const fetchDispatches = async () => {
  const dispatchCollection = collection(db, 'DepartmentsDispatch');
  const dispatchSnapshot = await getDocs(dispatchCollection);
  return dispatchSnapshot.docs.map(doc => doc.data());
};

export const processResults = async () => {
  const productStock = await fetchProductStock();
  const departments = await fetchDepartments();
  const dispatches = await fetchDispatches();

  // Initialize results structure
  const productMap = new Map();
  departments.forEach(dept => {
    productMap.set(dept.departmentCode, {});
  });

  // Aggregate dispatched amounts
  dispatches.forEach(dispatch => {
    const { departmentCode, products } = dispatch;
    if (!productMap.has(departmentCode)) return;

    const departmentData = productMap.get(departmentCode);
    products.forEach(product => {
      const { productCode, dispatchedAmount } = product;
      if (!departmentData[productCode]) {
        departmentData[productCode] = 0;
      }
      departmentData[productCode] += dispatchedAmount;
    });
  });

  // Structure the results
  return productStock.map(product => {
    const { productCode, productName, totalQty } = product;
    const row = { productCode, productName, totalQty };

    departments.forEach(dept => {
      row[dept.departmentCode] = productMap.get(dept.departmentCode)[productCode] || 0;
    });

    return row;
  });
};
