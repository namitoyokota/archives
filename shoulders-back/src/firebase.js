import firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyBFFA1bfYMnLEcxeXoLyRdQ0gxDT_DHlHQ",
  authDomain: "nameless-240620.firebaseapp.com",
  databaseURL: "https://nameless-240620.firebaseio.com",
  projectId: "nameless-240620",
  storageBucket: "nameless-240620.appspot.com",
  messagingSenderId: "138551216061",
  appId: "1:138551216061:web:3729c953c0aba4ef"
};
firebase.initializeApp(firebaseConfig);

export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();

export default firebase;