import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyATpwc-VN8p-I5WnpcvKlUP03Dxi4ZjE7g",
  authDomain: "zenith-2c6c8.firebaseapp.com",
  projectId: "zenith-2c6c8",
  storageBucket: "zenith-2c6c8.firebasestorage.app",
  messagingSenderId: "713491654394",
  appId: "1:713491654394:web:2a78b370883c93e6a80b43"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);  

export default app;