import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyATpwc-VN8p-I5WnpcvKlUP03Dxi4ZjE7g",
  authDomain: "zenith-2c6c8.firebaseapp.com",
  projectId: "zenith-2c6c8",
  storageBucket: "zenith-2c6c8.firebasestorage.app",
  messagingSenderId: "713491654394",
  appId: "1:713491654394:web:2a78b370883c93e6a80b43"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth so we can use it in App.jsx
export const auth = getAuth(app);

export default app;