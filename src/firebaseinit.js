import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDqR2leco9zvUmnQFzbBF8PfIyUEllJHaY",
    authDomain: "vue-firebasep.firebaseapp.com",
    projectId: "vue-firebasep",
    storageBucket: "vue-firebasep.appspot.com",
    messagingSenderId: "688478706827",
    appId: "1:688478706827:web:f1113b0f3653a7bbbcc88e",
    measurementId: "G-K2EQGYBMQY"
  };

const app = initializeApp(firebaseConfig);

const auth = getAuth();

const whenSignedIn = $('[id=whenSignedIn]');
const whenSignedOut = $('[id=whenSignedOut]');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

whenSignedIn.hide();
whenSignedOut.hide();

const provider = new GoogleAuthProvider();

signInBtn.onclick = () => signInWithPopup(auth, provider);

signOutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        whenSignedIn.show();
        whenSignedOut.hide();

    } else {
        whenSignedIn.hide();
        whenSignedOut.show();
    }
});


