// Firebase web config for the existing MedStart project.
// These values identify the project; Firestore security rules protect the data.
const firebaseConfig = {
  apiKey: "AIzaSyAIbc-OynEKpvVYO1b5ngG5SKzcGqFz4Yc",
  authDomain: "medstart-aa55c.firebaseapp.com",
  projectId: "medstart-aa55c",
  storageBucket: "medstart-aa55c.firebasestorage.app",
  messagingSenderId: "265393052344",
  appId: "1:265393052344:web:b07a860a0427fcbaf9b24d",
  measurementId: "G-QN47YLNCHJ"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
