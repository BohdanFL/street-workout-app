// База данних
const db = firebase.database()

// Список місяців
let dataDays = []

// Список місяців
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

// Назва останнього місяця
const lastMonthName = document.querySelector('.last-month-name')
// Число останнього місяця
const lastMonthNumber = document.querySelector('.last-month-number')

const year = document.querySelector('.year')

let totalChecked = 0
const output = document.querySelector('.year__total.total')

const menuItem = document.querySelectorAll(".menu__item")
const blocks = document.querySelectorAll(".block")

// Списки елементів
const lowLevelList = document.querySelector('.low-level__list')
const mediumLevelList = document.querySelector('.medium-level__list')
const highLevelList = document.querySelector('.high-level__list')

// Загрузка слайдера
let loadSlider = true

const topWrapper = document.querySelector('.top__wrapper')

function daysInMonths() {
    for (let i = 0; i < 12; i++) {
        dataDays.push(32 - new Date(new Date().getFullYear(), i, 32).getDate())
    }
}
daysInMonths()


lastMonthNumber.textContent = localStorage.getItem('lastMonthNumber')

function initMonths(userID) {
    for (let iM = 0; iM < monthNames.length; iM++) {
        const monthName = monthNames[iM];
        const dataDay = dataDays[iM];
        let month = `
        <div class="month">
            <div class="month__wrapper month-${iM}">
            <p>${monthName}: 
                <span class="month__number">${dataDay}</span>
                <span class="month__total"></span>
            </p>
            <div class="month__day-name">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span>Сб</span>
                <span>Нд</span>
            </div>
            <div class="month__btns"></div>
            </div>
        </div>
        `
        if (new Date().getMonth() === iM) {
            month = `
        <div class="month">
            <div class="month__wrapper month-${iM} active">
            <p>${monthName}: 
                <span class="month__number">${dataDay}</span>
                <span class="month__total"></span>
            </p>
            <div class="month__day-name">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span>Сб</span>
                <span>Нд</span>
            </div>
            <div class="month__btns"></div>
            </div>
        </div>
        `
        }
        if (new Date().getMonth() - 1 === iM) {
            lastMonthName.textContent = monthName
        }
        year.insertAdjacentHTML("beforeend", month)

        const monthBtns = document.querySelectorAll('.month__btns')
        const monthBtn = monthBtns[iM]

        db.ref('users/' + userID + '/visiting/months/' + monthName + '/').once('value').then(dataTotal => {
            for (let iD = 1; iD <= dataTotal.val().total; iD++) {
                // Створюємо кнопки
                const checkElem = document.createElement('input')
                // Додаємо клас
                checkElem.classList.add('check-js')
                if (new Date().getMonth() === iM && new Date().getDate() === iD) {
                    checkElem.classList.add('active')
                }
                checkElem.setAttribute('data-day', (iD))
                // Добавляємо тип кнопки
                checkElem.setAttribute('type', 'checkbox')
                if (dataTotal.val().days[iD] == 1) {
                    checkElem.checked = true
                }
                // Вставляємо
                monthBtn.appendChild(checkElem)
            }
        })
    }
}

function getDataElements(userID, level, list) {
    const totalElem = document.querySelector('.' + level + '-level-total')
    const learnElem = document.querySelector('.' + level + '-level-learn')
    db.ref('users/' + userID + '/elements' + '/' + level + '/elems/').once('value')
        .then(elemsUserData => {
            let total = 0,
                learn = 0
            for (const key in elemsUserData.val()) {
                let value = elemsUserData.val()[key];
                let checked = ''
                total++
                if (value) {
                    checked = 'checked'
                    learn++
                }
                totalElem.textContent = total
                learnElem.textContent = learn
                const item = `
            <li class="elements__item">
                <label>
                    ${key}<input class="elements__check" type="checkbox" ${checked}>
                </label>
            </li>`
                list.insertAdjacentHTML('beforeend', item)

                list.querySelectorAll('.elements__check').forEach(item => {
                    item.addEventListener('click', () => {
                        learnElem.textContent = learn
                        if (key.trim() === item.parentElement.textContent.trim()) {
                            if (item.checked) {
                                value = 1
                                learn++
                            } else {
                                value = 0
                                learn--
                            }
                            learnElem.textContent = learn

                            db.ref('users/' + userID + '/elements' + '/' + level + '/elems/').update({
                                [key]: value
                            })
                            db.ref('users/' + userID + '/elements' + '/' + level + '/').update({
                                total: total,
                                learn: learn
                            })

                            db.ref('users/' + userID + '/elements/')
                                .once('value').then(dataElements => {
                                    const low = dataElements.val().low
                                    const medium = dataElements.val().medium
                                    const high = dataElements.val().high
                                    db.ref('users/' + userID + '/elements/').update({
                                        total: low.total + medium.total + high.total,
                                        learn: low.learn + medium.learn + high.learn
                                    })
                                })
                            calcLevel(userID)
                        }
                    })
                })
            }
        })
}

function createSubLists() {
    let subLists = document.querySelectorAll('.sublist')
    subLists.forEach(subList => {
        subList.addEventListener('click', () => {
            subList.querySelector('.sublist ul').classList.toggle('showlist')
            subList.querySelector('.sublist ul').classList.toggle('hidelist')
        })
    })
}

function createTop() {
    topWrapper.innerHTML = ''
    db.ref('users/').once('value')
        .then(dataUser => {

            const topAccounts = [];
            for (const key in dataUser.val()) {
                const value = dataUser.val()[key];
                value.charac.level = Math.round(
                    (value.elements.low.learn * 0.2) +
                    (value.elements.medium.learn * 0.6) + (value.elements.high.learn * 1)
                )

                const topAccount = `
                    <div class="top__account text-center rounded-pill mb-2 py-4 px-4">
                    <h3 class="top__place">Топ </h3>
                        <ul class="top__list m-0">
                        <li class="top__item"> Никнейм: ${value.charac.nickname} </li>
                        <li class="top__item"> Рівень: ${value.charac.level} </li>
                        <li class="top__item"> К-сть відвідувань: ${value.visiting.total} </li>
                        <li class="top__item sublist">
                            К-сть вивчених елементів
                            <ul class="hidelist m-0">
                                <li> Загально: ${value.elements.learn} </li>
                                <li> Низького рівня: ${value.elements.low.learn} </li>
                                <li> Середнього рівня: ${value.elements.medium.learn} </li>
                                <li> Високого рівня: ${value.elements.high.learn} </li>
                            </ul>
                        </li>
                        </ul>
                    </div>
                `
                topAccounts.push({
                    html: topAccount,
                    level: value.charac.level
                })
                topAccounts.sort(function (a, b) {
                    return b.level - a.level;
                });
            }
            topAccounts.forEach(item => {
                topWrapper.insertAdjacentHTML('beforeend', item.html)
            })
            document.querySelectorAll('.top__place').forEach((item, placeIndex) => {
                item.textContent = `Топ ${++placeIndex}`
            })
            createSubLists()
        })
}

function checkingMonths(userID) {
    db.ref('users/' + userID + '/visiting/').once('value')
        .then(month => {
            totalChecked = month.val().total
            output.textContent = totalChecked
            for (let i = 0; i < monthNames.length; i++) {
                const monthName = monthNames[i]

                const monthWrapper = document.querySelector('.month-' + i)
                const checkboxs = monthWrapper.querySelectorAll('.check-js')

                let switchCheck = 1

                let monthChecked = month.val().months[monthName].checked
                checkboxs.forEach(checkbox => {
                    checkbox.addEventListener('click', () => {
                        const checkedDay = checkbox.getAttribute('data-day')
                        if (checkbox.checked) {
                            switchCheck = 1
                            monthChecked++
                        } else {
                            switchCheck = 0
                            monthChecked--
                        }

                        console.log(monthName + ': ' + monthChecked)
                        db.ref('users/' + userID + '/visiting/months/' + monthName + '/').update({
                            checked: monthChecked
                        })
                        db.ref('users/' + userID + '/visiting/months/' + monthName + '/days/').update({
                            [checkedDay]: switchCheck
                        })
                        // console.log(monthName)
                        // console.log(monthWrapper)
                        // console.log(checkboxs)
                    })
                })
                const firstBtn = document.querySelectorAll('.month__btns .check-js:first-child')
                let dayInWeek = new Date(new Date().getFullYear(), i).getDay()
                if (dayInWeek == 0) {
                    dayInWeek = 7
                }
                firstBtn[i].style.marginLeft = (35 * (dayInWeek - 1)) + 'px'
            }

            const checkboxs = document.querySelectorAll('.check-js')
            checkboxs.forEach(checkbox => {
                checkbox.addEventListener('click', () => {
                    if (checkbox.checked) {
                        totalChecked++
                    } else {
                        totalChecked--
                    }
                    output.textContent = totalChecked
                    db.ref('users/' + userID + '/visiting/').update({
                        total: totalChecked
                    })
                })
            })
        })
}

function calcLevel(userID) {
    db.ref('users/' + userID + '/').once('value').then(user => {
        level = Math.round((user.val().elements.low.learn * 0.2) + (user.val().elements.medium.learn * 0.6) + (user.val().elements.high.learn * 1))
        db.ref('users/' + userID + '/charac/level/').set(level)
    })
}

function fillTopBar() {
    const currentUser = firebase.auth().currentUser
    db.ref('users/' + currentUser.uid + '/charac').once('value').then(userCharac => {
        document.querySelector('.top-bar__nickname span').textContent = userCharac.val().nickname
        document.querySelector('.top-bar__level span').textContent = userCharac.val().level

    })
}

// Прослуховуємо чи має користувач аккаунт
firebase.auth().onAuthStateChanged((user) => {
    if (user) {

        initMonths(user.uid)

        checkingMonths(user.uid)

        // Получаємо бази данних елементів користувача
        getDataElements(user.uid, 'low', lowLevelList)
        getDataElements(user.uid, 'medium', mediumLevelList)
        getDataElements(user.uid, 'high', highLevelList)
        fillTopBar()
    } else {
        window.location = 'https://bohdanflexer.github.io/street-workout-app//login.html'
    }
});

menuItem.forEach(item => {
    item.addEventListener("click", () => {
        menuItem.forEach(item => {
            item.classList.remove("active")
        })
        item.classList.add("active")
        const currentItem = document.querySelector('.menu__item.active')

        blocks.forEach(item => {
            item.classList.add('hide')

            if (currentItem.classList[1] === item.classList[1]) {
                item.classList.remove('hide')
                if (item.classList.contains('top')) {
                    createTop()
                }
                if (item.classList.contains('visiting') && loadSlider) {
                    loadSlider = false
                    $('.year').slick({
                            slidesToShow: 3,
                            slidesToScroll: 3,
                            swipe: false,
                            prevArrow: '<svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-arrow-left-circle-fill slider-arrow slider-prev" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-4.5.5a.5.5 0 0 0 0-1H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5z"/></svg>',
                            nextArrow: '<svg width="2em" height="2em" viewBox="0 0 16 16" class="bi bi-arrow-right-circle-fill slider-arrow slider-next" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-11.5.5a.5.5 0 0 1 0-1h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5z"/></svg>',
                            responsive: [{
                                    breakpoint: 1441,
                                    settings: {
                                        slidesToShow: 3,
                                        slidesToScroll: 1,
                                        infinite: true
                                    }
                                },
                                {
                                    breakpoint: 1025,
                                    settings: {
                                        slidesToShow: 2,
                                        slidesToScroll: 2
                                    }
                                },
                                {
                                    breakpoint: 686,
                                    settings: {
                                        slidesToShow: 1,
                                        slidesToScroll: 1,
                                        swipe: true,
                                        arrows: false,
                                        dots: true,
                                        appendDots: $('.dots__wrapper')
                                    }
                                }
                            ]
                        },
                        $(this).on('init', () => {
                            document.querySelectorAll('.slick-dots button').forEach((dotText, index) => {
                                dotText.textContent = monthNames[index].substring(0, 3)
                            })
                        })
                    );
                    $('.year').slick('slickGoTo', new Date().getMonth())
                }
            }
        })
    })
})



// При кліці на кнопку виходимо з аккаунту
document.querySelector('#sign-out').addEventListener('click', () => {
    firebase.auth().signOut()
})
//` TODO:
//` Відсортувати коритувачів по рівням (на стороні бази данних)
//`
//`
//`