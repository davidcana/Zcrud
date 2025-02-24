/* 
    requestHelper singleton class
*/
"use strict";

module.exports = (function() {

    /**
     * @param {string} url
     * @param {Object|undefined} object
     * @param {Function} successCallback
     * @param {Function=} errorCallback
     * 
     */
    var post = function( url, object, successCallback, errorCallback ){

        // Build formData object.
        //let formData = new FormData();
        //for ( var key in object ){
        //    formData.append( key, object[ key ]);
        //}
        const data = new URLSearchParams();
        for ( var key in object ){
            const value = object[ key ];
            
            if ( Array.isArray( value ) ) {
                for ( var i = 0; i < value.length; ++i ){
                    data.append( key + '[]', value[ i ] );
                }
            } else {
                data.append( key, value );
            }
        }

        const requestOptions = {
            'method': 'POST',
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            'body': data
        };
        fetch(
            url,
            requestOptions
        ).then(
            function( response ){
                if ( ! response.ok ){
                    runErrorCallback( errorCallback, response );
                    return;
                }
                return response.json();
            }
        ).then(
            function( data ){
                if ( data ){
                    successCallback( data );
                    /*
                    if ( data === true || data[ 'result' ]  === 'true' ){
                        successCallback( data );
                    } else {
                        runErrorCallback( errorCallback, undefined, undefined, data[ 'error' ] );
                    }
                    */
                }
            }
        ).catch(
            function( error ){
                runErrorCallback( errorCallback, error );
            }
        );
    };

    /**
     * @param {Object} fecthOptions
     * 
     */
    var requestFetch = function( fecthOptions ){

        post(
            fecthOptions.url,
            fecthOptions.data,
            fecthOptions.success,
            fecthOptions.error
        );
    };

    /**
     * @param {Function} errorCallback
     * @param {*=} errorInstance
     * 
     */
    var runErrorCallback = function( errorCallback, errorInstance ){
        errorCallback( errorInstance );
    };

    return {
        fetch: requestFetch
    };
})();
