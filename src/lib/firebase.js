import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAfJIh5LTU_KN2elG2pAxt8fcolyyvmGz4",
  authDomain: "barberlog-1e901.firebaseapp.com",
  databaseURL: "https://barberlog-1e901-default-rtdb.firebaseio.com",
  projectId: "barberlog-1e901",
  storageBucket: "barberlog-1e901.firebasestorage.app",
  messagingSenderId: "759602408751",
  appId: "1:759602408751:web:ffe4cb458335e1ce3605da",
  measurementId: "G-EGY6D52NZ8"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
