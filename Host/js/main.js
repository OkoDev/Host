const drawer = document.querySelector('.menu__btn');
const menu = document.querySelector('.menu__box');


drawer.addEventListener('click', (event) => {
    drawer.classList.toggle('active');
    menu.classList.toggle('active');

})

const DELAY = 500;
let CURRENT_SLIDE = 1;
const ANIMATION_DELAY = 8000;

const slider = document.querySelector('.slider');

slider.addEventListener('click', function (event) {
    if (!event.target.classList.contains('slider__icon')) return;

    CURRENT_SLIDE = parseInt(event.target.getAttribute('data-id'));
    showSliderId(CURRENT_SLIDE);
});

initSlider();

function showSliderId(id) {
    var current = slider.querySelector('[data-slide="'+ id + '"]');

    slider.querySelectorAll('.slider__slide').forEach(function(slide) {
        slide.style.opacity = 0;
        setTimeout(function() {
            slide.classList.add('hide');
        }, DELAY);
    });

    setTimeout(function() {
        current.classList.remove('hide');
        current.style.opacity = 1;
    }, DELAY)
}

function initSlider() {
    setInterval(function() {
        showSliderId(getSliderId());
    }, ANIMATION_DELAY)
}

function getSliderId() {
    CURRENT_SLIDE = CURRENT_SLIDE + 1;
    CURRENT_SLIDE = CURRENT_SLIDE % 4 === 0 ? 1 : CURRENT_SLIDE;
    return CURRENT_SLIDE;
}



