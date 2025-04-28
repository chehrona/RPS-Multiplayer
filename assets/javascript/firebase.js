import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
} from "https://www.gstatic.com/firebasejs/9.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZrfcX2V7iJtWNDmyyU6lan6mmlS1o3Hw",
  authDomain: "multi-rps-cd56d.firebaseapp.com",
  projectId: "multi-rps-cd56d",
  databaseURL: "https://multi-rps-cd56d-default-rtdb.firebaseio.com/",
  storageBucket: "multi-rps-cd56d.appspot.com",
  messagingSenderId: "309281822897",
  appId: "1:309281822897:web:81aa3e8458154811f36a90",
  measurementId: "G-5L5YJBPDFD",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const playersRef = ref(db, "players");
export const playerOneRef = ref(db, "players/1");
export const playerTwoRef = ref(db, "players/2");
export const turnRef = ref(db, "turn");
export let chatRef = ref(db, "chat");
