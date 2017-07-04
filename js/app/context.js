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
    
    /* */
    
    
    return {
        put: put,
        get: get
    };
})();
