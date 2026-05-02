import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBpv6VRIxdC9CMy3PpvK1S12QX3Rg2xkxU",
    authDomain: "matruka-2025.firebaseapp.com",
    databaseURL: "https://matruka-2025-default-rtdb.firebaseio.com",
    projectId: "matruka-2025",
    storageBucket: "matruka-2025.firebasestorage.app",
    messagingSenderId: "944698526913",
    appId: "1:944698526913:web:1b1c095335dc98e1291840",
    measurementId: "G-GXH6E367CF"
  };
  
// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Load farmer data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const docRef = doc(db, "farmers", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        document.getElementById("farmerName").innerText = data.name || "Not Provided";
        document.getElementById("farmerEmail").innerText = user.email || "Not Provided";
        document.getElementById("farmerLocation").innerText = data.location || "Not Provided";
        document.getElementById("farmerSoil").innerText = data.soilType || "Not Provided";
        document.getElementById("farmerFieldSize").innerText = data.yield || "Not Provided";
        document.getElementById("farmerCrops").innerText = data.cropRotation || "Not Provided";
      } else {
        alert("No farmer details found. Please fill them first.");
        window.location.href = "farmer-details.html";
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      alert("Error loading profile data.");
    }
  } else {
    window.location.href = "login.html";
  }
});

