import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDmWmCtU_zhbRf0f4vPn0P9TcXSVu_DJEM",
  authDomain: "expensetracker-dc3db.firebaseapp.com",
  projectId: "expensetracker-dc3db",
  storageBucket: "expensetracker-dc3db.firebasestorage.app",
  messagingSenderId: "265755996296",
  appId: "1:265755996296:web:faae021847b2c8ad8caf3d",
  measurementId: "G-N8VGGBTRDT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();