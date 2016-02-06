var API = {
    flickr: {
        accuracy: 11, // means city wide
        apiKey: '801387f8102145153e1cdd7b487e8afc',
        loadFormat: 'json',
        methods: {
            search: 'flickr.photos.search',
            getSizes: 'flickr.photos.getSizes'
        },
        noJsonCallback: 1,
        reqURL: 'https://api.flickr.com/services/rest/',

        /**
         * Retreives flickr photos that was taken in the same city as the given lat and lon.
         * @param {string} lat - lat.
         * @param {string} lon - lon.
         * @param {function} callback - callback function
         */
        retrievePhotosAround: function(lat, lon, page, perPage, callback) {
            var self = this;
            var params = {
                accuracy: this.accuracy,
                api_key: self.apiKey,
                format: self.loadFormat,
                lat: lat,
                lon: lon,
                method: self.methods.search,
                page: page,
                per_page: perPage,
                nojsoncallback: self.noJsonCallback
            };
            self._makeRequest('GET', params, callback);
        },

        // TODO:(ganbi) once ready, change doc
        /**
         * Retreives flickr photos that was taken in the same city as the given lat and lon.
         * @param {string} lat - lat.
         * @param {string} lon - lon.
         * @param {function} callback - callback function
         */
         /*
        photo {
            id: "23255878733",
            owner: "96275015@N02",
            secret: "f4524d2a12",
            server: "586",
            farm: 1,
            title: "Let it rain.. Let it rain",
            ispublic: 1,
            isfriend: 0,
            isfamily: 0
        }
         */
        retreiveSizes: function(photo, cb) {
            if (!photo) {
                if(cb) {
                    cb(null, 1);
                } else {
                    return;
                }
            }

            var self = this;
            var params = {
                api_key: self.apiKey,
                format: self.loadFormat,
                method: self.methods.getSizes,
                nojsoncallback: self.noJsonCallback,
                photo_id: photo.id
            };

            this._makeRequest('GET', params, cb);
        },

        createXHR: function() {
            try {
                return new XMLHttpRequest();
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    return new ActiveXObject("Msxml2.XMLHTTP");
                }
            }
        },

        // TODO:(ganbi) add doc when finalized
        _makeRequest: function(method, params, callback) {
            method = method || 'GET';
            params = params || {};
            var queryParams = this._constructParams(params);

            // TODO: opens new request every time?
            var xhttp = this.createXHR();
            xhttp.onreadystatechange = function() {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    var jsondata = eval('(' + xhttp.responseText + ')')
                    // TODO: (ganbi) handle error messages
                    if (callback) {
                        callback(jsondata);
                    }
                }
                // TODO: handle errors
            };
            xhttp.open(method, this.reqURL + queryParams, true);
            xhttp.send();
        },

        _constructParams: function(params) {
            if (!params) {
                return '';
            }

            var finalParams = '?';
            var key;
            var par;
            for (par in params) {
                if (params.hasOwnProperty(par)) {
                    finalParams = finalParams + par + '=' + params[par] + '&';
                }
            }
            return finalParams;
        }
    }
};
