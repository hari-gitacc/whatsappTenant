document.getElementById('login-form').addEventListener('click', function(event) {
    event.preventDefault();

   const savedUsername = '1'; 
  const savedPassword = '1'; 

   const enteredUsername = document.getElementById('username2').value;
  const enteredPassword = document.getElementById('password2').value;

  if (enteredUsername === savedUsername && enteredPassword === savedPassword) {
        window.location.href = 'home.html'; 
  } else {
        alert('Invalid username or password. Please try again.');
    }
});
