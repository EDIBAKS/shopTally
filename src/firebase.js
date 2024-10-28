// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";



const firebaseConfig = {
  apiKey: "AIzaSyCeKg7A_Tj3HFCAig0Yf_Lpv5QPqZQdryc",
  authDomain: "nn-game-guide-47b4e.firebaseapp.com",
  projectId: "nn-game-guide-47b4e",
  storageBucket: "nn-game-guide-47b4e.appspot.com",
  messagingSenderId: "603314830313",
  appId: "1:603314830313:web:540f39f26baef155d72978"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export{db,auth};