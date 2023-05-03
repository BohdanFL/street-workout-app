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
let lastMonthName
// Число останнього місяця
let lastMonthNumber = localStorage.getItem('lastMonthNumber')


let lastElementName = localStorage.getItem('lastElementName')
let lastElementDate = localStorage.getItem('lastElementDate')

const year = document.querySelector('.year')

let totalChecked = 0
const output = document.querySelector('.year__total.total')

const menuItem = document.querySelectorAll(".menu__item")
const blocks = document.querySelectorAll(".block")
const charac = document.querySelectorAll(".charac.block")

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
            lastMonthName = monthName
        }
        year.insertAdjacentHTML("beforeend", month)

        const monthBtns = document.querySelectorAll('.month__btns')
        const monthBtn = monthBtns[iM]

        db.ref('users/' + userID + '/visiting/months/' + monthName + '/').once('value').then(dataTotal => {
            document.querySelector('.month-' + iM + ' .month__total').textContent = '(' + dataTotal.val().checked + ')'
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
                        lastElementDate = new Date().toLocaleDateString()
                        lastElementName = item.parentElement.textContent.trim()

                        localStorage.setItem('lastElementName', lastElementName)
                        localStorage.setItem('lastElementDate', lastElementDate)

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
                <div class="top__wrapper-account sublist">
                    <div class="top__account d-flex align-items-center justify-content-between rounded-pill my-sm-2 my-1 py-1 px-3">
                        <div class="d-flex">
                            <span class="top__nick">
                                ${value.charac.nickname}
                            </span>
                            <span class="top__lvl px-2 rounded-pill ml-2">
                                ${value.charac.level}
                            </span>
                            <img class="drop-down-arrow" src="img/002-drop-down-arrow.svg" alt="">
                        </div>
                        <div class="top__place">
                            Позиція <span>1</span>
                        </div>
                    </div>
                    <ul class="top__hidelist mb-1">
                        <li> К-сть відвідувань: ${value.visiting.total} </li>
                        <em>К-сть вивчених елементів</em>
                        <li> Загально: ${value.elements.learn} </li>
                        <li> Низького рівня: ${value.elements.low.learn} </li>
                        <li> Середнього рівня: ${value.elements.medium.learn} </li>
                        <li> Високого рівня: ${value.elements.high.learn} </li>
                    </ul>
                </div>
                `
                topAccounts.push({
                    html: topAccount,
                    level: value.charac.level
                })
                topAccounts.sort((a, b) => b.level - a.level);
            }
            topAccounts.forEach(item => {
                topWrapper.insertAdjacentHTML('beforeend', item.html)
            })
            document.querySelectorAll('.top__place span').forEach((item, placeIndex) => {
                item.textContent = ++placeIndex
            })
            createSubLists()
        })
}

function createCharac() {
    charac[0].innerHTML = ''
    const currentUserID = firebase.auth().currentUser.uid
    let characVisitingMonths = ''
    let lastElementDateChanged
    for (let i = 0; i < monthNames.length; i++) {
        const monthName = monthNames[i];
        db.ref('users/' + currentUserID + '/visiting/months/' + monthName + '/checked').once('value')
            .then(value => {
                characVisitingMonths = characVisitingMonths + `<li>${monthName}: ${value.val()} </li>`
            })
        i2 = i + 1
        if (lastElementDate) {
            lastElementDateChanged = lastElementDate.split('.')
            if (lastElementDateChanged[1] === i2.toString()) {
                lastElementDateChanged[1] = monthName
            }
        }
    }

    db.ref('users/' + currentUserID + '/').once('value')
        .then(value => {
            const {
                elements,
                visiting
            } = value.val()
            const characHTML = `
                <div class="charac__elements">
                <h3 class="mb-2">Елементи</h3>
                <ul class="charac__elements-list">
                    <li class="sublist">К-сть вивчених елементів
                        <img class="drop-down-arrow" src="img/002-drop-down-arrow.svg" alt="">
                        <ul>
                            <li>
                                Загально: ${elements.learn}
                            </li>
                            <li>
                                Низького рівня: ${elements.low.learn}
                            </li>
                            <li>
                                Середнього рівня: ${elements.medium.learn}
                            </li>
                            <li>
                                Високого рівня: ${elements.high.learn}
                            </li>
                        </ul>
                    </li>
                    <li>Останній вивчений елемент: ${lastElementName} - ${lastElementDateChanged.join(' ')}</li>
                </ul>
            </div>
            <div class="charac__visiting">
                <h3 class="mb-2">Відвідування</h3>
                <ul class="charac__visiting-list">
                    <li>Всього відвідувань: ${visiting.total}</li>
                    <li>Відвідувань за останній місяць(${lastMonthName}): ${lastMonthNumber}<span
                            class="last-month-number"></span></li>
                    <li class="sublist">Відвідування по місяцям
                        <img class="drop-down-arrow" src="img/002-drop-down-arrow.svg" alt="">
                        <ul class="charac__visiting-months">
                            ${characVisitingMonths}
                        </ul>
                    </li>
                </ul>
            </div>
            `
            charac[0].insertAdjacentHTML('beforeend', characHTML)
            createSubLists()
        })

}

function createSubLists() {
    let subLists = document.querySelectorAll('.sublist')
    subLists.forEach(subList => {
        const list = subList.querySelector('.sublist ul')
        let deg = 0
        subList.addEventListener('click', () => {
            list.classList.toggle('hidelist')
            subList.querySelector('img').style.transform = 'rotateZ(' + (deg ? deg = deg + 180 : deg = deg - 180) + 'deg)'
        })
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
                const monthTotal = monthWrapper.querySelector('.month__total')
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
                        monthTotal.textContent = '(' + monthChecked + ')'

                        db.ref('users/' + userID + '/visiting/months/' + monthName + '/').update({
                            checked: monthChecked
                        })
                        db.ref('users/' + userID + '/visiting/months/' + monthName + '/days/').update({
                            [checkedDay]: switchCheck
                        })
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
        fillTopBar()
    })
}

function fillTopBar() {
    const currentUser = firebase.auth().currentUser
    db.ref('users/' + currentUser.uid + '/charac').once('value').then(userCharac => {
        document.querySelector('.top-bar__nickname span').textContent = userCharac.val().nickname
        document.querySelector('.top-bar__level span').textContent = userCharac.val().level

    })
}

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
            if (item.classList.contains('top')) {
                createTop()
            }
            if (item.classList.contains('charac')) {
                createCharac()
            }
        })
    })
})

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
        // createSubLists()
    } else {
        window.location = 'https://bohdanfl.gihub.io/street-workout-app/login.html'
    }
});


// При кліці на кнопку виходимо з аккаунту
document.querySelector('#sign-out').addEventListener('click', () => {
    firebase.auth().signOut()
})
//` TODO:
//` Відсортувати коритувачів по рівням (на стороні бази данних)
//` Оптимізувація скачування данних, а конкретніше відвідуваннь і елементів
//` Поміняти схему відвідування і добавити в неї роки
//` Згропувати елементи
//`
