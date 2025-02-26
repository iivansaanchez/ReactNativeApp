// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaPqsX2iy9QI8g6JpROxOSGLYI3s4O_As",
  authDomain: "example-bb79f.firebaseapp.com",
  projectId: "example-bb79f",
  storageBucket: "example-bb79f.firebasestorage.app",
  messagingSenderId: "201641656451",
  appId: "1:201641656451:web:34277d970adcdc7e175bb6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);