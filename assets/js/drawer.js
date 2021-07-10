const drawer = document.querySelector('.menu__btn');
const menu = document.querySelector('.menu__box');


drawer.addEventListener('click', (event) => {
    drawer.classList.toggle('active');
    menu.classList.toggle('active');

})
