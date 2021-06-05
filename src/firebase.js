import firebase from "firebase/app";
import "@firebase/firestore";

const config = {
  apiKey: "AIzaSyBw8sTcwzDLS-COXJRw2bu2Tg4UIxlP6Pc",
  authDomain: "video-chat-d7186.firebaseapp.com",
  databaseURL:
    "https://video-chat-d7186-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "video-chat-d7186",
  storageBucket: "video-chat-d7186.appspot.com",
  messagingSenderId: "862984595199",
  appId: "1:862984595199:web:1fbf4b2db4dc8e60810eca",
};
// Initialize Firebase
export const firebaseApp = firebase.initializeApp(config);

const db = firebaseApp.firestore();
// const db = fb.firestore()
const room = db.collection(`room`);

export const createRoom = (r) => {
  return room.add(r);
};

export const updateRoom = (uuid, r) => {
  return room.doc(uuid).update(r);
};

export const getData = async(uuid) => {
    const roomDetail =  await room.doc(uuid).get()
    return roomDetail.data()
}

