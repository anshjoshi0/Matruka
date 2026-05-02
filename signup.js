// Your Firebase config (replace with your own from Firebase Console)
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Handle signup
document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        // Update display name
        return user.updateProfile({ displayName: name });
      })
      .then(() => {
        alert("Signup successful! Welcome, " + name);
        window.location.href = "farmer-details.html";
      })
      .catch((error) => {
        alert("Error: " + error.message);
        console.error(error);
      });
  });
});

