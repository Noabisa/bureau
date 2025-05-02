const loginButton = document.getElementById('login-button');
loginButton.addEventListener('click', () => {
    const email = prompt('Enter your email');
    const password = prompt('Enter your password');
    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));
});
