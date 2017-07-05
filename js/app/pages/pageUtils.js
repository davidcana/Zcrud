/* 
    context singleton class
*/
module.exports = (function() {
    "use strict";
        
    var configureTemplate = function( options, templatePath ){
        options.target.attr(
            'data-muse-macro', templatePath );
    };
    /*
    var mainPage = undefined;
    var setMainPage() = function( mainPageToApply ){
        mainPage = mainPageToApply;
    };
    var getMainPage() = function(){
        return mainPage;
    };*/
    
    return {
        configureTemplate: configureTemplate
    };
})();
