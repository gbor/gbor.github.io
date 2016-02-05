// TODO: doesn't belong here, wrap with something
function addEvent(element,evName,fn) {
    if (element.addEventListener) {
        element.addEventListener(evName,fn,false);
    } else if (element.attachEvent) {
        element.attachEvent('on'+evName,function(e) {
            fn(e || window.event);
        });
    }
}
// add event listener to only the parent of all tiles to use bubbling and to have less number of listeners.
// TODO: better way to handle the bind? Is this performant?
addEvent(document.getElementById('tiles'), 'click', Gallery.openLightbox.bind(Gallery));
addEvent(document.getElementsByClassName('lightbox')[0], 'click', Gallery.onLightboxClick.bind(Gallery));
addEvent(document.getElementsByClassName('prev')[0], 'click', Gallery.onPrevClick.bind(Gallery));
addEvent(document.getElementsByClassName('next')[0], 'click', Gallery.onNextClick.bind(Gallery));
addEvent(document.getElementsByClassName('js-close')[0], 'click', Gallery.closeLightbox.bind(Gallery));
addEvent(document.getElementsByClassName('js-slideshow')[0],'mousedown', function(e){ e.preventDefault(); });
// keyboard input
addEvent(document, 'keydown', function (e) {
    var LEFT_ARROW = 37;
    var RIGHT_ARROW = 39;
    var ESC = 27;
    e = e || window.event;
    var keyCode = e.which && e.which || e.keyCode;
    if (keyCode === LEFT_ARROW) {
        Gallery.onPrevClick.bind(Gallery)();
    } else if (keyCode === RIGHT_ARROW) {
        Gallery.onNextClick.bind(Gallery)();
    } else if (keyCode === ESC) {
        Gallery.closeLightbox.bind(Gallery)();
    }
});
window.onscroll = function() {
    // var buffer = 150; // px
    var D = document;
    var docEl = D.documentElement;
    var offset = (docEl.scrollTop || window.pageYOffset) + window.innerHeight;
    var height = Math.max(
        D.body.scrollHeight, docEl.scrollHeight,
        D.body.offsetHeight, docEl.offsetHeight,
        D.body.clientHeight, docEl.clientHeight
    );

    // TODO: clean up later, for safari and IE had to it this way for now
    if ( !Gallery.isLoading &&
        (
            (offset === height) ||
            (offset > height )
        ) &&
        !Gallery.isPagesComplete()
    ) {
        Gallery.populateTiles();;
    }
};
