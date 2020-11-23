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

const elemsCheckLow = document.querySelectorAll('.low-level .elements__check')
const elemsCheckMedium = document.querySelectorAll('.medium-level .elements__check')
const elemsCheckHigh = document.querySelectorAll('.high-level .elements__check')

const output = document.querySelector('.year__total.total')
const characTotal = document.querySelector('.charac__visiting-total.total')
const year = document.querySelector('.year')

const checkboxs = document.querySelectorAll('.check-js')
let total = localStorage.getItem('total') || 0
output.innerHTML = localStorage.getItem('total')
characTotal.innerHTML = output.innerHTML
let checkedList = localStorage.getItem('checkedList').split(',') || []

const lastMonthName = document.querySelector('.last-month-name')
const lastMonthNumber = document.querySelector('.last-month-number')

const menuItem = document.querySelectorAll(".menu__item")
const blocks = document.querySelectorAll(".block")
let loadSlider = true

const subLists = document.querySelectorAll('.sublist')

const lowLeveList = document.querySelector('.low-level__list')
const mediumLeveList = document.querySelector('.medium-level__list')
const highLeveList = document.querySelector('.high-level__list')

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        const elementsList = {
            low: {
                sadf: 0,
                sadf: 4,
                tbtrgfvds: 0,
                yten: 10,
                trbf: 0
            },
            medium: {
                sadf: 0,
                sadf: 5,
                tbtrgfvds: 0,
                yten: 15,
                trbf: 2
            },
            high: {
                sadf: 5,
                sadf: 0,
                tbtrgfvds: 5,
                yten: 10,
                trbf: 2
            }
        }
        getElements('low', lowLeveList)

        firebase.database().ref('elements/low/').once('value').then(function (snapshot) {
            console.log(snapshot.val());

        })
        const updates = {}
        updates['elements/low'] = elementsList
        firebase.database().ref('users/' + user.uid).update(updates)
        // getElements('medium', mediumLeveList)
        // getElements('high', highLeveList)
    } else {
        window.location = 'login.html'
    }
});



function daysInMonths() {
    for (let i = 0; i < 12; i++) {
        dataDays.push(32 - new Date(new Date().getFullYear(), i, 32).getDate())
    }
}
daysInMonths()


function getElements(level, list) {
    firebase.database().ref('elements/' + level + '/').once('value').then((snapshot) => {
        const val = snapshot.val()
        for (const key in val) {
            let checked = ''
            if (val[key]) {
                console.log(val[key]);
                checked = 'checked'
            }
            const item = `
            <li class="elements__item">
                <label>
                    <span class="elements__item-text">
                    ${key}
                    </span>
                    <input class="elements__check" type="checkbox" ${checked}>
                </label>
            </li>`
            list.insertAdjacentHTML('beforeend', item)
        }

    });
}

function checkLevel(elemsCheck, learnElem, totalElem) {
    let total = 0
    let learn = 0
    const learnLevel = document.querySelector(learnElem)
    const totalLevel = document.querySelector(totalElem)
    elemsCheck.forEach(low => {
        console.log(low);
        total++
        low.addEventListener('click', () => {
            if (low.checked) {
                learn++
            } else {
                learn--
            }
            learnLevel.textContent = learn
        })
        totalLevel.textContent = total
    });
}

function checkInput() {
    if (checkbox.checked) {
        checkedList.push(index)
        total++
    } else {
        checkedList.forEach((item, indexItem) => {
            if (parseInt(item) == index) {
                checkedList.splice(indexItem, 1)
            }
        })
        total--
    }
    localStorage.setItem('checkedList', checkedList)
    localStorage.setItem('total', total)
    output.innerHTML = total
    characTotal.innerHTML = total
    let checkedDays = 0
    const monthWrapper = checkbox.parentElement.parentElement
    monthWrapper.querySelectorAll('.check-js').forEach(item => {
        if (item.checked) {
            checkedDays++
        }
        if (monthWrapper.parentElement.getAttribute('data-slick-index') * 1 === new Date().getMonth() - 1) {
            lastMonthNumber.textContent = checkedDays
            localStorage.setItem('lastMonthNumber', lastMonthNumber.textContent)
        }
        monthWrapper.children[0].children[1].textContent = `(${checkedDays})`
    })
}

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

checkLevel(elemsCheckMedium, '.medium-level-learn', '.medium-level-total')
checkLevel(elemsCheckHigh, '.high-level-learn', '.high-level-total')

document.querySelector('#sign-out').addEventListener('click', () => {
    firebase.auth().signOut()
})