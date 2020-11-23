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

const output = document.querySelector('.year__total.total')
const characTotal = document.querySelector('.charac__visiting-total.total')

const subLists = document.querySelectorAll('.sublist')

const checkboxs = document.querySelectorAll('.check-js')
let total = localStorage.getItem('total') || 0
output.innerHTML = localStorage.getItem('total')
characTotal.innerHTML = output.innerHTML
let checkedList = localStorage.getItem('checkedList').split(',') || []

const menuItem = document.querySelectorAll(".menu__item")
const blocks = document.querySelectorAll(".block")

// Списки елементів
const lowLevelList = document.querySelector('.low-level__list')
const mediumLevelList = document.querySelector('.medium-level__list')
const highLevelList = document.querySelector('.high-level__list')

// Загрузка слайдера
let loadSlider = true

function daysInMonths() {
    for (let i = 0; i < 12; i++) {
        dataDays.push(32 - new Date(new Date().getFullYear(), i, 32).getDate())
    }
}
daysInMonths()

lastMonthNumber.textContent = localStorage.getItem('lastMonthNumber')
for (let iM = 0; iM < monthNames.length; iM++) {
    const monthName = monthNames[iM];
    const dataDay = dataDays[iM];
    let month = `
    <div class="month">
        <div class="month__wrapper">
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
            <div class="month__wrapper active">
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

    for (let iD = 0; iD < dataDay; iD++) {
        // Створюємо кнопки
        const checkElem = document.createElement('input')
        // Додаємо клас
        checkElem.classList.add('check-js')
        if (new Date().getMonth() === iM && new Date().getDate() === iD) {
            checkElem.classList.add('active')
        }
        // Добавляємо тип кнопки
        checkElem.setAttribute('type', 'checkbox')
        // Вставляємо
        monthBtn.appendChild(checkElem)
    }
}

function getDataElements(userID, level, list) {
    let total = 0,
        learn = 0
    const totalElem = document.querySelector('.' + level + '-level-total')
    const learnElem = document.querySelector('.' + level + '-level-learn')
    db.ref('users/' + userID + '/elements' + '/' + level + '/').once('value')
        .then(elemsUserData => {
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

                            db.ref('users/' + userID + '/elements' + '/' + level + '/').update({
                                [key]: value
                            })
                        }
                    })
                })
            }
        })
}


checkboxs.forEach((checkbox, index) => {
    checkedList.forEach(item => {
        if (index == parseInt(item)) {
            checkbox.click()
        }
    })

    checkbox.addEventListener('click', () => {
        checkInput()
    })
})

/// Top
const topWrapper = document.querySelector('.top__wrapper')

function createTop(userId) {

    db.ref('users/').once('value')
        .then(dataUser => {
            for (const key in dataUser.val()) {
                const value = dataUser.val()[key];
                console.log(value.charac.nickname);
            }
        })
    //      <div class="top__account">
    //      <h3>Топ 1 </h3>
    //          <ul class="top__list">
    //         <li class="top__item"> Никнейм: Богдан </li>
    //         <li class="top__item"> Рівень: 40 </li>
    //         <li class="top__item"> К-сть відвідувань: 325 </li>
    //         <li class="top__item sublist">
    //             К-сть вивчених елементів
    //             <ul class="hidelist">
    //                 <li> Загально: 74 </li>
    //                 <li> Низького рівня: 50 </li>
    //                 <li> Середнього рівня: 20 </li>
    //                 <li> Високого рівня: 4 </li>
    //             </ul>
    //         </li>
    //          </ul>
    //      </div>
}







// Прослуховуємо чи має користувач аккаунт
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // Получаємо бази данних елементів користувача
        getDataElements(user.uid, 'low', lowLevelList)
        getDataElements(user.uid, 'medium', mediumLevelList)
        getDataElements(user.uid, 'high', highLevelList)

        createTop(user.uid)

    } else {
        window.location = 'login.html'
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

subLists.forEach(subList => {
    subList.addEventListener('click', () => {
        subList.querySelector('.sublist ul').classList.toggle('showlist')
        subList.querySelector('.sublist ul').classList.toggle('hidelist')
    })
})



// При кліці на кнопку виходимо з аккаунту
document.querySelector('#sign-out').addEventListener('click', () => {
    firebase.auth().signOut()
})