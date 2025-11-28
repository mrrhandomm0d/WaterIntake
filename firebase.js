// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  getDocs 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDaIiSqRzPqRvAR4Bzxp72GVd55EPwBv74",
  authDomain: "waterintake-1ce98.firebaseapp.com",
  projectId: "waterintake-1ce98",
  storageBucket: "waterintake-1ce98.firebasestorage.app",
  messagingSenderId: "486377826199",
  appId: "1:486377826199:web:6bbe43389d9e158d6c86d2",
  measurementId: "G-G7GBDGQKFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const fs = getFirestore(app);

// Export Firestore and functions
export { fs, collection, onSnapshot, getDocs };
