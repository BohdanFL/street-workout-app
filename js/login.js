const formLogin = document.querySelector('#form-login')

formLogin.addEventListener('submit', (e) => {
    e.preventDefault()
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            window.location = 'https://bohdanfl.gihub.io/street-workout-app/account.html'
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
        });
})
