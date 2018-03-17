(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAnPG5E0925PdrxFpnXVwOgcpTjy1mo7hE",
    authDomain: "pin-pints.firebaseapp.com",
    databaseURL: "https://pin-pints.firebaseio.com",
    projectId: "pin-pints",
    storageBucket: "pin-pints.appspot.com",
    messagingSenderId: "367160574099"
  };
  firebase.initializeApp(config);

  // Get Elements
  const txtEmail = document.getElementById('txtEmail');
  const txtPassword = document.getElementById('txtPassword');
  const btnLogin = document.getElementById('btnLogin');
  const btnSignup = document.getElementById('btnSignup');
  const btnLogout = document.getElementById('btnLogout');

  // Login Event
  btnLogin.addEventListener('click', e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
  });

  // Signup Event
  btnSignup.addEventListener('click', e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
  });

  btnLogout.addEventListener('click', e=> {
    firebase.auth().signOut();
  });

  firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser){
      console.log(firebaseUser);
      btnLogout.removeAttribute("hidden");
    } else {
      console.log("not logged in");
      btnLogout.setAttribute("hidden", "");
    }
  });

}());
