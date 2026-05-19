import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: "AIzaSyB5aCNCrx9wQw-BNv0vTKCjUEALQaiiKsM",
  authDomain: "attendanceprojectds.firebaseapp.com",
  databaseURL: "https://attendanceprojectds-default-rtdb.firebaseio.com",
  projectId: "attendanceprojectds",
  storageBucket: "attendanceprojectds.firebasestorage.app",
  messagingSenderId: "143411322576",
  appId: "1:143411322576:web:18f179aee0bb68f17948d5",
  measurementId: "G-LMEWFLKLNK"
};
const app = initializeApp(firebaseConfig);

const persistence = getReactNativePersistence(AsyncStorage);
export const auth = initializeAuth(app, { persistence });

export const db = getFirestore(app);

export default app;
