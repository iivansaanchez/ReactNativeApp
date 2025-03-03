
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyCNsk7OsVsTxtHxDLaB0U73ptefbhIRBzw",
  authDomain: "example-cb50e.firebaseapp.com",
  projectId: "example-cb50e",
  storageBucket: "example-cb50e.firebasestorage.app",
  messagingSenderId: "475265006558",
  appId: "1:475265006558:web:dee14808657753c5463b4f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);