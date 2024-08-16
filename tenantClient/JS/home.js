const register = document.getElementById('register').addEventListener('click',function(){
    window.location.href = 'login.html';
});

document.getElementById('login-form').addEventListener('click', function(event) {
    event.preventDefault();  // Prevent form submission

    const savedUsername = '1'; // Replace with actual saved username
    const savedPassword = '1'; // Replace with actual saved password

    const enteredUsername = document.getElementById('username2').value;
    const enteredPassword = document.getElementById('password2').value;

    if (enteredUsername === savedUsername && enteredPassword === savedPassword) {
        window.location.href = 'index.html'; // Redirect to WhatsApp page on success
    } else {
        alert('Invalid username or password. Please try again.');
    }
});
