// База данних
const db = firebase.database()

let dataDays = []

let monthNames = [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень'
]

function daysInMonths() {
    for (let i = 0; i < 12; i++) {
        dataDays.push(32 - new Date(new Date().getFullYear(), i, 32).getDate())
    }
}
daysInMonths()

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
            db.ref('users/' + user.user.uid).set({
                charac: {
                    nickname: nickname,
                    email: email,
                    level: 0,
                    placeInTop: 0
                },
                elements: {
                    low: 0,
                    medium: 0,
                    high: 0
                },
                visiting: {
                    months: {
                        Січень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Лютий: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Березень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Квітень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Травень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Червень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Липень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Серпень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Вересень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Жовтень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Листопад: {
                            checked: 0,
                            total: 0,
                            days: 0
                        },
                        Грудень: {
                            checked: 0,
                            total: 0,
                            days: 0
                        }
                    },
                    total: 0
                },
            })
            // Получаємо базу данних елементів
            db.ref('elements/').once('value')
                .then(elemsData => {
                    // Записуємо базу данних елементів до данних користувача
                    db.ref('users/' + user.user.uid + '/elements/').set(elemsData.val())
                })
            for (let iM = 0; iM < monthNames.length; iM++) {
                const monthName = monthNames[iM];
                const dataDay = dataDays[iM];
                let days = {}
                let monthObj = {
                    checked: 0
                }
                for (let i = 1; i <= dataDay; i++) {
                    days[i] = 0
                    monthObj['total'] = dataDay
                    monthObj['days'] = days
                }
                db.ref('users/' + user.user.uid + '/visiting/months/' + monthName + '/').update(monthObj)
            }
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
            window.location = 'https://bohdanfl.github.io/street-workout-app/account.html'
        }, 3000)
    } else {
        return
    }
});
