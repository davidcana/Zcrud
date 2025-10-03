/* 
    context singleton class
*/


import { zpt } from '../../node_modules/zpt/index.js';

export const context = (function() {
    
    var subformSeparator = '-';
    
    // Cache
    var cache = {};
    var put = function ( id, data ){
        cache[ id ] = data;
    };
    var get = function ( id ){
        return cache[ id ];
    };
    
    // I18n
    var i18nArray = undefined;
    var setI18nArray = function( i18nArrayToApply ){
        i18nArray = i18nArrayToApply;
    };
    var translate = function( id, params, format, subformat ){
        return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
    };
    /*
    var i18nExists = function( id ){ //TODO Reimplement this using i18n.exists
        var translated = translate( id );
        return translated !== 'I18n resource "' + id + '" not found!'
    };
    var translateAlternatives = function( ids, params, format, subformat ){
        for ( const id of ids ) {
            if ( i18nExists( id ) ){
                return zpt.i18nHelper.tr( i18nArray, id, params, format || 'string', subformat );
            }
        }
        return 'No i18n resource found: ' + ids;

    };
    */

    // Errors
    var showError = function ( options, throwException, message, mustTranslate, params, format, subformat ) {
        var translated = 
            mustTranslate? 
            translate( message, params, format, subformat ): 
            message;
        options.errorFunction( translated );
        if ( throwException ){
            throw translated;
        }
    };
    var confirm = function ( options, confirmOptions, onFulfilled ) {
        options.confirmFunction( confirmOptions, onFulfilled );
    };
    var showMessage = function ( options, messageOptions ) {
        options.showMessageFunction( messageOptions );
    };

    // Options
    //TODO Make putOptions and getOptions simpler: setOptions and getOptions with no params (saving just one instance of options)
    var putOptions = function( $item, options ){
        put( 'options_' + getSelectorString( $item ), options );
    };
    var getOptions = function( $item ){
        return get( 'options_' + getSelectorString( $item ) );
    };
    
    // Pages
    var putPage = function( id, page ){
        put( 'page_' + id, page );
    };
    var getPage = function( id ){
        return get( 'page_' + id );
    };

    var getSelectorString = function( $item ){
        var selector = ( typeof( $item.attr( 'id' ) ) !== 'undefined' || $item.attr( 'id' ) !== null )?
            '#' + $item.attr( 'id' ):
            '.' + $item.attr( 'class' );
        return selector;
    };
    
    var getListPage = function( listPageIdSource ){
        try {
            var listPageId = typeof listPageIdSource === 'object'? listPageIdSource.pageConf.pages.list.id: listPageIdSource;
        } catch ( e ) {
            alert( 'Exception trying to get options.pageConf.pages.list.id!' );
            return false;
        }
        
        return getPage( listPageId );
    };    
    
    var getFormPage = function( formPageIdSource ){
        try {
            var formPageId = typeof formPageIdSource === 'object'? formPageIdSource.formId: formPageIdSource;
        } catch ( e ) {
            alert( 'Exception trying to get options.pageConf.pages.list.id!' );
            return false;
        }

        return getPage( formPageId );
    }; 
    
    // Add to declaredRemotePageUrls all non repeated urls
    var declareRemotePageUrl = function( template, declaredRemotePageUrls ){
        if ( ! template ){
            return;
        }

        var index = template.indexOf( '@' );
        if ( index != -1 ){
            var url = template.substring( 1 + index );
            if ( declaredRemotePageUrls.indexOf( url ) == -1 ){
                declaredRemotePageUrls.push( url );
            }
        }
    };
    
    // Fields
    var getField = function( fields, fullName ){
        var fieldData = getFieldData( fullName );
        return fieldData.subformName? fields[ fieldData.subformName ].fields[ fieldData.name ]: fields[ fieldData.name ];
    };
    var getFieldData = function( fullName ){
        var subformSeparatorIndex = fullName.indexOf( subformSeparator );
        return {
            subformName: subformSeparatorIndex === -1? null: fullName.substring( 0, subformSeparatorIndex ),
            name: subformSeparatorIndex === -1? fullName: fullName.substring( 1 + subformSeparatorIndex )
        };
    };

    // Field builder
    var fieldBuilder = undefined;
    var setFieldBuilder = function( fieldBuildertoApply ){
        fieldBuilder = fieldBuildertoApply;
    };
    var getFieldBuilder = function(){
        return fieldBuilder;
    };
    
    // History
    var history = undefined;
    var setHistory = function( historytoApply ){
        history = historytoApply;
    };
    var getHistory = function(){
        return history;
    };
    
    // Subforms
    var buildSubformsRecordsIdFromFieldId = function( options, subformsRecordsId ){
        return subformsRecordsId + options.subformsRecordsSuffix;
    };
    var buildFieldIdFromSubformsRecordsId = function( options, subformsRecordsId ){
        return removeChars( subformsRecordsId, options.subformsRecordsSuffix );
    };
    var removeChars = function( string, toRemove ){
        return string.replace( toRemove, '' );
    };
    
    // Dictionary
    var dictionary;
    var setDictionary = function( _dictionary ){
        dictionary = _dictionary;
    };
    var getDictionary = function(){
        return dictionary;
    };
    
    return {
        put: put,
        get: get,
        setI18nArray: setI18nArray,
        translate: translate,
        //translateAlternatives: translateAlternatives,
        showError: showError,
        confirm: confirm,
        showMessage: showMessage,
        putOptions: putOptions,
        getOptions: getOptions,
        putPage: putPage,
        getPage: getPage,
        getSelectorString: getSelectorString,
        getListPage: getListPage,
        getFormPage: getFormPage,
        declareRemotePageUrl: declareRemotePageUrl,
        getField: getField,
        getFieldData: getFieldData,
        subformSeparator: subformSeparator,
        setFieldBuilder: setFieldBuilder,
        getFieldBuilder: getFieldBuilder,
        setHistory: setHistory,
        getHistory: getHistory,
        buildSubformsRecordsIdFromFieldId: buildSubformsRecordsIdFromFieldId,
        buildFieldIdFromSubformsRecordsId: buildFieldIdFromSubformsRecordsId,
        setDictionary: setDictionary,
        getDictionary: getDictionary
    };
})();
