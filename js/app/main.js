/* 
    Main class of ZCrud
*/
var $ = require( 'jquery' );
var zpt = require( 'zpt' );
var log = zpt.logHelper;
var context = require( './context.js' );
var ListPage = require( './pages/listPage.js' );
var FormPage = require( './pages/formPage.js' );
var normalizer = require( './normalizer.js' );
var fieldBuilder = require( './fields/fieldBuilder' );
var defaultOptions = require( './defaultOptions.js' );

exports.init = function( userOptions, callback ){
    
    // Register in options.dictionary I18n instances
    var initI18n = function(){

        // Build the list of file paths
        var fileNames = options.i18n.files[ options.i18n.language ];
        if ( ! fileNames ){
            throw( 'No file names set to init i18n subsystem!' );
        }

        // Build ZPT parser and add it to context
        var zptOptions = {
            root: options.body,
            dictionary: options.dictionary,
            declaredRemotePageUrls: options.allDeclaredRemotePageUrls,
            notRemoveGeneratedTags: true,
            i18n: {
                urlPrefix: options.i18n.filesPath,
                files: {}
            }
        };
        zptOptions.i18n.files[ options.i18n.language ] = fileNames;
        var zptParser = zpt.buildParser( zptOptions );
        context.setZPTParser( zptParser );
        
        // Init ZPT parser
        zptParser.init(
            function(){
                context.setI18nArray( options.dictionary.i18nArray );
                callback( options );
            }
        );
    };

    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    
    // Configure logging
    zpt.context.getConf().loggingOn = options.logging.isOn;
    zpt.context.getConf().loggingLevel = options.logging.level;

    log.info( 'Initializing ZCrud...' );
    
    // Register all field managers
    fieldBuilder.registerAllConstructors( options.fieldsConfig.constructors );
    context.setFieldBuilder( fieldBuilder );
    
    // Normalize options
    normalizer.run( options, userOptions );
    
    // Init I18n
    initI18n();
    
    log.info( '...ZCrud initialized.' );
    
    return options;
};

exports.renderList = function( options, data, callback ){

    log.info( 'Rendering list...' );
    
    var listPage =  new ListPage( options, data );
    context.putPage( listPage.getId(), listPage );
    listPage.show( 
        {
            callback: callback
        } 
    );
    
    log.info( '...list rendering finished.' );
};

exports.renderForm = function( options, data, callback ){

    log.info( 'Rendering form...' );

    data = data || {};
    data.type = 'list';
    var formPage = new FormPage( options, data ); 
    
    context.putPage( formPage.getId(), formPage );
    formPage.show( 
        {
            callback: callback
        } 
    );
    
    log.info( '...form rendering finished.' );
};

exports.destroy = function( options ){
    options.target.empty();
};

exports.showCreateForm = function( listPageIdSource ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showCreateForm();
};

exports.showUpdateForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showEditForm( undefined, key );
};

exports.showDeleteForm = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.showDeleteForm( undefined, key );
};

exports.getRecordByKey = function( listPageIdSource, key ){
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordByKey( key );
};

exports.getRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRecordsArray();
};

exports.getRowByKey = function( listPageIdSource, key ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getRowByKey( key );
};

exports.selectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRecords( rows );
};

exports.deselectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRecords( rows );
};

exports.selectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).selectRows( rows );
};

exports.deselectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.getSecureComponent( 'selecting' ).deselectRows( rows );
};

exports.getSelectedRows = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSecureComponent( 'selecting' ).getSelectedRows();
};

exports.getSelectedRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSecureComponent( 'selecting' ).getSelectedRecords();
};

var recordOperationCommon = function( listPageIdSource, data, checkRecord, checkKey, method, type ){
    
    if ( checkRecord && ! data.record ){
        alert( 'Record not set in ' + method + ' method!' );
        return false;
    }
    
    if ( checkKey && ! data.key ){
        alert( 'Key not set in ' + method + ' method!' );
        return false;
    }
    
    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return false;
    }
    
    return listPage.instanceNewForm( type, data.key );
};

exports.addRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, false, 'addRecord', 'create' );
    if ( formPage ){
        formPage.addRecord( data );
    }
};

exports.updateRecord = function( listPageIdSource, data ){
    
    var formPage = recordOperationCommon( listPageIdSource, data, true, true, 'updateRecord', 'update' );
    if ( formPage ){
        formPage.updateRecord( data );
    }
};

exports.deleteRecord = function( listPageIdSource, data ){

    var formPage = recordOperationCommon( listPageIdSource, data, false, true, 'deleteRecord', 'delete' );
    if ( formPage ){
        formPage.deleteRecord( data );
    }
};

exports.getListPage = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage;
};

exports.getFormPage = function( formPageIdSource ){

    var formPage = context.getFormPage( formPageIdSource );
    if ( ! formPage ){
        alert( 'No form found using that source:' + formPageIdSource );
        return;
    }
    return formPage;
};
