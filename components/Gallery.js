// Contains the logic of populating tiles and managing lighbox slideshow
var Gallery = {
    batchSlideLoad: 6,
    currentSlide: {
        node: null,
        page: null,
        idx: null
    },
    isLoading: false,
    lightBoxOrder: [],  // the sizes are populated here in the order in which the API returned each sizes
    nextLoad: 5, // num of next slides to load not including the current initially.
    nextPage: 1,
    perceivedLoadRatio: 1.5,
    perPage: 100,
    photos: [], // (index + 1) are the pages
    prevLoad: 2, // num of prev slides to load not including the current initially. initially === everytime lb opens
    YOS_LOC: {
        lat: '37.87',
        lon: '-119.54'
    },
    SF_LOC: {
        lat: '37.7758',
        lon: '122.4128'
    },
    populateTiles: function () {
        this._addSpinner();
        // TODO: take user input for the location OR detect from user IP
        // use Yosemite location for now.
        var lat = this.YOS_LOC.lat;
        var lon = this.YOS_LOC.lon;
        API.flickr.retrievePhotosAround(
            lat, lon,
            this.nextPage,
            this.perPage,
            this._afterPhotosRetrieved.bind(this) // once Photos are retrieved, uses that to retrieve sizes and renders the tiles
        );
    },

    _afterPhotosRetrieved: function (data, error) {
        var self = this;
        if (data && !error) {
            // TODO: There seems like a bug where some pages comes back empty but with status 200.
            // Then skip this page and warn max photo is reached.
            if (data.photos.photo.length === 0 ) {
                this.isLoading = false;
                this._closeSpinner.call(this);
                this._showWarning.call(this);
                if (this.callNextOnDone) {
                    this.callNextOnDone = false;
                }
                // self.nextPage++;  // we could try to skip this page as well
                return;
            }
            self.photos[self.nextPage - 1] = data;
            var photos = data.photos && data.photos.photo;
            var page = self.nextPage;
            var totalLoaded = 0;
            photos.forEach(function(photo, idx){
                // TODO:(ganbi) change the page to var
                API.flickr.retreiveSizes(photo,
                    function (sizes, error) {
                        var self = this;
                        this._afterSizesRetrieved.call(this, sizes, page, idx, error);
                        totalLoaded++;
                        // as soon as first 100/this.perceivedLoadRatio% (33% example) of the perpage images are loaded
                        // turn off throbber. so that we can have the percieved load time while we still have time
                        // from the user to scroll.
                        // Mean while the others will still be loading
                        if (totalLoaded === Math.floor(this.perPage/this.perceivedLoadRatio)) {
                            this._closeSpinner();
                            if (this.callNextOnDone) {
                                this._loadSlides(
                                    parseInt(this.currentSlide.idx, 10) + 2,
                                    this.batchSlideLoad
                                );
                                this.callNextOnDone = false;
                                this.onNextClick();
                            }
                        }

                        // however don't change the isLoading state until we're done with this page loading
                        // so that next load is blocked until this one is done.
                        if (totalLoaded === photos.length) {
                            this.isLoading = false;
                        }
                    }.bind(self)
                );
            });
            self.nextPage++;
        } else if (error) {
            // TODO: handle error;
        }
    },

    _afterSizesRetrieved: function (data, page, photoIndx, error) {
        if (data && !error) {
            var pageIndx = page - 1;
            this.photos[pageIndx].photos.photo[photoIndx].sizes = data.sizes;
            data.photoIndx = photoIndx;
            data.pageIndx = pageIndx;
            data.title = this.photos[pageIndx].photos.photo[photoIndx].title;
            this.lightBoxOrder.push(data);
            var ordIndx = this.lightBoxOrder.length - 1;
            this._renderTile(data, page, ordIndx);
        } else if (error) {
            // TODO: handle errors.
        }
    },

    _renderTile: function (data, page, ordIndx) {
        var sizes = data.sizes.size;
        var l = sizes.length;

        // get the 150 square size, skipp images smaller than that
        // Safari doesn't work with l ==> 2, what?
        if (l > 2 || l === 2){
            var sq150 = sizes[1];
            if (sq150.label === 'Large Square' || sq150.label == 'Original') {
                var tiles = document.getElementById('tiles');
                var title = this._getTitle(ordIndx) || 'No Title';
                var tempDiv = document.createElement('div');
                // TODO:if it's a very small original image, the w and h won't be 150px.
                //      leave the ratio but put it in a 150x150 container and use flexbox
                tempDiv.innerHTML =
                    '<img ' +
                        'src="' + sq150.source + '" ' +
                        'data-page="' + page + '" ' +
                        'data-indx="' + ordIndx + '" ' +
                        'title="' + title + '" ' +
                        'alt="' + title + '" ' +
                        'style="' + 'width: 150px; height: 150px' + '" ' +
                    '/>';
                tiles.appendChild(tempDiv.firstChild);
            }
        }
    },

    // TODO: DRY!!!! for the next 4 functions
    _addSpinner: function () {
        this.isLoading = true;
        var spinnerNode = document.getElementsByClassName('js-spinner')[0];
        spinnerNode.style.display = 'block';
        spinnerNode.style.top = '80%';
    },

    _closeSpinner: function () {
        var spinnerNode = document.getElementsByClassName('js-spinner')[0];
        spinnerNode.style.display = '';
        spinnerNode.style.top = '';
    },

    _showWarning: function () {
        var warningNode = document.getElementsByClassName('js-warning')[0];
        warningNode.style.display = 'block';
        warningNode.style.top = '50%';
        setTimeout(function () {
            this._hideWarning();
        }.bind(this), 3000);
    },

    _hideWarning: function () {
        var warningNode = document.getElementsByClassName('js-warning')[0];
        warningNode.style.display = '';
        warningNode.style.top = '';
    },

    _getDataAtt: function (elm, dataAtt) {
        if(elm.dataset !== undefined) { // standard approach
            return elm.dataset[dataAtt];
        } else {
            // TODO: dataAtt might come in camel cased
            return elm.getAttribute('data-' + dataAtt); // IE approach
        }
    },

    openLightbox: function (e) {
        var targ = this._getTarget(e);
        var page = this._getDataAtt(targ, 'page');
        var photoIndx = this._getDataAtt(targ, 'indx');
        this.currentSlide.page = page;
        this.currentSlide.idx = photoIndx;
        this.currentSlide.isSlideBeforeLast = this._isSlideBeforeLast();
        this.currentSlide.isSecondSlide = this._isSecondSlide();
        var startIndex = photoIndx - this.prevLoad;
        var numOfSlides = this.prevLoad + this.nextLoad + 1;
        this._loadSlides(startIndex, numOfSlides);
        this._updateImageNote();
        document.getElementsByTagName('body')[0].style.overflow = 'hidden';
        document.getElementsByClassName('lightbox')[0].className += ' D(flex)';
    },

    // starts to load slides on the given img.
    // start index is inclusive
    // returns
    // TODO: break this into smaller functions, to long
    _loadSlides: function (startIndex, numOfSlides, isPrepend) {

        // TODO: worry about going from page to page, or page ending
        // TODO: change indx to idx
        var slidesContainer = document.getElementsByClassName('js-slides')[0];

        var ordIndx = this.currentSlide.idx;
        var i;
        var tempDiv;
        var params;
        var currentIndex;
        // TODO: or if start index is bigger than the available widh??
        // TODO: on the two edge when we run into another page?
        // TODO: startindex is inclusive so check that.
        if ( isPrepend && startIndex < 0 ) {
            return true;
        } else if (!isPrepend && startIndex < 0) {
            currentIndex = 0;
        } else {
            currentIndex = startIndex;
        }

        for (i = 0; i < numOfSlides; i++) {
            var pageIndex = this.currentSlide.page - 1;

            params = {};
            // TODO: normalize the sizes getting function. we're using it somewhere else as well
            // TODO: change num 6 to a getter function
            if (!this.lightBoxOrder[currentIndex]) {
                // change page breaking for now
                return true;
            }

            var chosenPhoto = 7;
            var sizes = this.lightBoxOrder[currentIndex].sizes;
            // TODO: move 8 out to a config
            if ( sizes && sizes.size.length < 8 ) {
                chosenPhoto = this.lightBoxOrder[currentIndex].sizes.size.length - 1;
            }
            var chosenSize = sizes.size[chosenPhoto];
            params.src = sizes.size[chosenPhoto].source;
            params.title = this.lightBoxOrder[currentIndex].title;
            // TODO: When the media is not photo, skip and don't add.  never Ran into that case.
            // TODO: when it goes to the next page this page have to change and cannot stay the same
            params.page = pageIndex + 1;
            params.idx = currentIndex;
            if (currentIndex < ordIndx) {
                params.style = 'left: -100%;';
            } else if (currentIndex == ordIndx) {
                // TODO: intentially chose == for now.
                params.style = 'left: 0;';
            } else {
                params.style = 'left: 100%;';
            }

            tempDiv = document.createElement('div');
            tempDiv.innerHTML = this._constructSlide(params);


            if (isPrepend) {
                slidesContainer.insertBefore(tempDiv.firstChild, slidesContainer.childNodes[0]);
            }  else {
                slidesContainer.appendChild(tempDiv.firstChild);
            }

            if (currentIndex == ordIndx) {
                // TODO: intentially chose == for now.
                this.currentSlide.node = slidesContainer.lastElementChild;
            }

            if (isPrepend) {
                currentIndex--;
            }  else {
                currentIndex++;
            }
        }
    },

    _constructSlide: function (params) {
        if (!params) {
            return '';
        }

        params.title = params.title || '';
        return (
            '<li ' +
                'style="' + params.style + '" ' +
                'data-page="' + params.page  + '" ' +
                'data-indx="' + params.idx + '" ' +
            '>' +
                 '<figure>' +
                    '<img src="' + params.src + '">' +
                    ( params.title && '<figcaption >' + params.title + '</figcaption>' || '' ) +
                '</figure>' +
            '</li>'
        );
    },

    _getTotalImageNum: function () {
        if (!this.photos || this.photos.length === 0 ) {
            return 0;
        }

        return this.photos[0].photos.total;
    },

    _updateImageNote: function () {
        var photoIndex = this.currentSlide.idx;
        // TODO: catch exception
        photoIndex = parseInt(photoIndex, 10);
        var total = this._getTotalImageNum();
        var current = photoIndex + 1;
        var title = this._getTitle(photoIndex);

        document.getElementsByClassName('js-photo-count')[0].innerHTML = current + ' of ' + total;
        document.getElementsByClassName('js-image-caption')[0].innerHTML = title;
    },

    _getTitle: function(photoIndex) {
        return this.lightBoxOrder[photoIndex].title;
    },

    onNextClick: function () {
        // TODO: What happens if we're at the end of the slide? Hide the buttons?
        var current = this.currentSlide.node;
        if (!current) {
            return;
        }
        var next = current.nextElementSibling;

        if (!next || this.callNextOnDone) {
            return;
        }

        if (!next.nextElementSibling && !this.isLoading && !this.isPagesComplete() ) {
            this.callNextOnDone = true;
            Gallery.populateTiles();
            return;
        }

        current.style.left = '-100%';
        next.style.left = '0';
        if (!this.currentSlide.isSlideBeforeLast && !next.nextElementSibling.nextElementSibling) {
            this._loadSlides(
                parseInt(this._getDataAtt(next.nextElementSibling, 'indx'), 10) + 1,
                this.batchSlideLoad
            );
        }
        // TODO: need to change page as well here
        this.currentSlide.node = next;
        this.currentSlide.idx = this._getDataAtt(next, 'indx');
        this.currentSlide.page = this._getDataAtt(next, 'page');
        this.currentSlide.isSlideBeforeLast = this._isSlideBeforeLast();
        this.currentSlide.isSecondSlide = this._isSecondSlide();
        this._updateImageNote();

        // TODO: make the button disapper when no more
    },

    _isSlideBeforeLast: function () {
        return this.currentSlide.idx == this.lightBoxOrder.lenght - 2;
    },

    _isSecondSlide: function () {
        return this.currentSlide.idx == 1;
    },

    onPrevClick: function () {
        var current = this.currentSlide.node;
        if (!current) {
            return;
        }
        var prev = current.previousElementSibling;
        if (!prev) {
            return;
        }
        current.style.left = '100%';
        prev.style.left = '0';
        if (!this.currentSlide.isSecondSlide && !prev.previousElementSibling.previousElementSibling) {
            this._loadSlides(
                parseInt(this._getDataAtt(prev.previousElementSibling, 'indx'), 10) - 1,
                this.batchSlideLoad,
                true
            );
        }
        this.currentSlide.node = prev;
        this.currentSlide.idx = this._getDataAtt(prev, 'indx');
        this.currentSlide.page = this._getDataAtt(prev, 'page');
        this.currentSlide.oneBeforeLast = this._isSlideBeforeLast();
        this.currentSlide.isSecondSlide = this._isSecondSlide();
        this._updateImageNote();
    },

    // when lighbbox is clicked close it, remove the ul children, reset the currentSlide
    onLightboxClick: function (e) {
        var targ = this._getTarget(e);

        if ( targ.className.indexOf('lightbox') > -1 ) {
            this.closeLightbox();
        }
    },

    closeLightbox: function () {
        document.getElementsByTagName('body')[0].style.overflow = '';
        document.getElementsByClassName('lightbox')[0].className = 'lightbox';
        // TODO: slow using querySelector but only when we close so it's ok for now.
        var matchingTileNodes = document.querySelector('[data-indx="' + this.currentSlide.idx + '"]');
        // TODO: Add smooth scrolling but not fast.
        matchingTileNodes.scrollIntoView(true);
        matchingTileNodes.style.opacity = '.1';
        setTimeout(function () {
            matchingTileNodes.style.opacity = '';
        }, 1000);
        var slides =  document.getElementsByClassName('js-slides')[0];
        // removes all children to reset.
        // much faster and better than using .innerHTML = ''
        while (slides.firstChild) {
            slides.removeChild(slides.firstChild);
        }
    },

    _getTarget: function (e) {
        e = e || window.event;
        var targ = e.target || e.srcElement;
        // for safari
        if (targ.nodeType == 3) {
            targ = targ.parentNode;
        }

        return targ;
    },

    isPagesComplete: function () {
        var photos = this.photos;
        if (photos && photos.length > 0) {
            var l = photos.length;
            var lastPage = photos[l - 1];
            var lastLoadedPage = lastPage.photos.page;
            var availablePages = lastPage.photos.pages;
            if (lastLoadedPage === availablePages || lastLoadedPage > availablePages) {
                return true;
            }
        }
        return false;
    }
};
