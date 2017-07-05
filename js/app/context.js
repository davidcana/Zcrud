/* 
    context singleton class
*/
module.exports = (function() {
    "use strict";
    
    /* htmlCache */
    var htmlCache = {};
    var put = function ( id, data ){
        htmlCache[ id ] = data;
    };
    var get = function ( id ){
        return htmlCache[ id ];
    };
    
    /* mainPage */
    var mainPage = undefined;
    var setMainPage = function( mainPageToApply ){
        mainPage = mainPageToApply;
    };
    var getMainPage = function(){
        return mainPage;
    };
    
    return {
        put: put,
        get: get,
        setMainPage: setMainPage,
        getMainPage: getMainPage
    };
})();
