importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.3.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBLRcjlJ4y9hpvZQZD9FFAqZ_Ly5VOXC6E",
  authDomain: "chat-app-e7d9f.firebaseapp.com",
  projectId: "chat-app-e7d9f",
  storageBucket: "chat-app-e7d9f.appspot.com",
  messagingSenderId: "191557575674",
  appId: "1:191557575674:web:ab61b44658ef55c46cba43",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Received background message: ", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/chat-icon.png",
  });
});
