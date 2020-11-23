const formReg = document.querySelector('#form-reg')

formReg.addEventListener('submit', (e) => {
    e.preventDefault()
    const nickname = document.querySelector('#nickname').value
    const email = document.querySelector('#email').value
    const password = document.querySelector('#password').value
    const repeatPassword = document.querySelector('#repeat-password').value
    if (password.length < 6) {
        document.querySelector('.warning-length').hidden = false
        return
    } else {
        document.querySelector('.warning-length').hidden = true
    }
    if (password !== repeatPassword) {
        document.querySelector('.warning-correct').hidden = false
        return
    } else {
        document.querySelector('.warning-correct').hidden = true
    }

    firebase.auth()
        .createUserWithEmailAndPassword(email, password)
        .then(user => {
            console.log(user.user.uid);
            firebase.database().ref('users/' + user.user.uid).set({
                charac: {
                    nickname: nickname,
                    email: email,
                    level: 0
                },
                elements: {
                    low: 0,
                    medium: 0,
                    high: 0
                },
                visiting: {
                    months: {
                        Січень: 0,
                        Лютий: 0,
                        Березень: 0,
                        Квітень: 0,
                        Травень: 0,
                        Червень: 0,
                        Липень: 0,
                        Серпень: 0,
                        Вересень: 0,
                        Жовтень: 0,
                        Листопад: 0,
                        Грудень: 0
                    },
                    total: 0
                },
            })
            // Получаємо базу данних елементів
            firebase.database().ref('elements/').once('value')
                .then(elemsData => {
                    // Записуємо базу данних елементів до данних користувача
                    console.log(elemsData.val());
                    console.log(user.user.uid);
                    firebase.database().ref('users/' + user.user.uid + '/elements/').set(elemsData.val())
                })
        })
        .catch(error => {
            const errorCode = error.code
            const errorMessage = error.message
        })
})

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log(user);
        setTimeout(() => {
            window.location = 'account.html'
        }, 3000)
    } else {
        return
    }
});