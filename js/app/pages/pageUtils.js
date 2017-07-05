/* 
    context singleton class
*/
module.exports = (function() {
    "use strict";
        
    var configureTemplate = function( options, templatePath ){
        options.target.attr(
            'data-muse-macro', templatePath );
    };
    
    return {
        configureTemplate: configureTemplate
    };
})();
