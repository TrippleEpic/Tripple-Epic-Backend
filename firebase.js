const { getApp, getApps, initializeApp } = require("firebase/app");
const { getAuth } = require("firebase/auth");
const { getFirestore } = require("firebase/firestore");
const firebaseConfig = {
  apiKey: "AIzaSyC1j_x8JKsrDeWzG-zCPZNsQJmftnb-fhU",
  authDomain: "tripple-epic.firebaseapp.com",
  projectId: "tripple-epic",
  storageBucket: "tripple-epic.appspot.com",
  messagingSenderId: "707952708363",
  appId: "1:707952708363:web:85a1ba0649047fa313b00e",
  measurementId: "G-RB7XWLP51N",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

const db = getFirestore(app);
module.exports = { auth, db };
