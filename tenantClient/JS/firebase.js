// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBFjh1tv9Ix5HfpQ3TJRSnO-LhAgeBrL44",
//   authDomain: "whatsapp-tenant.firebaseapp.com",
//   projectId: "whatsapp-tenant",
//   storageBucket: "whatsapp-tenant.appspot.com",
//   messagingSenderId: "3734258642",
//   appId: "1:3734258642:web:8d20aefd23e8914f7c7e0b",
//   measurementId: "G-0MLGP2D7N0"
// };

// // Initialize Firebase
// firebase.initializeApp(firebaseConfig);

// document
//   .getElementById("register-button")
//   .addEventListener("click", function () {
//     const email = document.getElementById("email").value;
//     const password = document.getElementById("password").value;
//     // const confirmPassword = document.getElementById("confirm-password").value;
//     const name = document.getElementById("name").value;
//     const whatsappNumber = document.getElementById("whatsapp-number").value;
//     // const id = document.getElementById("id").value;
//     const accessToken = document.getElementById("access-token").value;
//     const verifyToken = document.getElementById("verify-token").value;

//     if (password) {
//       firebase
//         .auth()
//         .createUserWithEmailAndPassword(email, password)
//         .then((userCredential) => {
//           console.log(userCredential);

//           // After successful Firebase Authentication, send data to server
//           fetch("https://your-server-endpoint.com/register", {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               email: email,
//               name: name,
//               whatsappNumber: whatsappNumber,
//               // id: id,
//               accessToken: accessToken,
//               verifyToken: verifyToken,
//             }),
//           })
//             .then((response) => response.json())
//             .then((data) => {
//               console.log("Success:", data);
//               alert("Registration successful and data sent!");
//             })
//             .catch((error) => {
//               console.error("Error:", error);
//               alert(
//                 "Registration successful but failed to send data to server."
//               );
//             });
//         })
//         .catch((error) => {
//           const errorCode = error.code;
//           const errorMessage = error.message;
//           alert("Failed to create account: " + errorMessage);
//         });
//     } else {
//       alert("Passwords do not match.");
//     }
//   });
