/* 
    context singleton class
*/
module.exports = (function() {
    "use strict";
        
    var configureTemplate = function( options, templatePath ){
        options.target.attr(
            'data-muse-macro', templatePath );
    };
    
    /* Normalizes a number between given bounds or sets to a defaultValue
    *  if it is undefined
    *************************************************************************/
    var normalizeNumber = function ( number, min, max, defaultValue ) {
        
        if ( number == undefined || number == null || isNaN( number ) ) {
            return defaultValue;
        }

        if ( number < min ) {
            return min;
        }

        if ( number > max ) {
            return max;
        }

        return number;
    };
    
    return {
        configureTemplate: configureTemplate,
        normalizeNumber: normalizeNumber
    };
})();
