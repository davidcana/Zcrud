/* 

Public methods of ZCrud:
-----------------------

 - addRecord: Add a new record to the table. (!)
 - deleteRecord: Delete an existing record from the table. (!)
 - destroy: Completely removes table from it's container.
 - getRecordByKey: Get record by key field's value of the record.
 - init: Set options and normalize them.
 - load: Show the list page. 
 - getSelectedRecords: Return an array with the selected records.
 - getSelectedRows: Return a jQuery object with the selected rows.
 - selectRows: Make rows selected.
 - showCreateForm: Open a 'create new record' form dialog.
 - updateRecord: Update an existing record on the table. (!)
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
        var filePaths = [];
        var fileNames = options.i18n.files[ options.i18n.language ];
        if ( ! fileNames ){
            throw( 'No file names set to init i18n subsystem!' );
        }
            
        for ( var c = 0; c < fileNames.length; c++ ) {
            var fileName = fileNames[ c ];
            var filePath = options.i18n.filesPath? options.i18n.filesPath + '/' + fileName: fileName;
            filePaths.push( filePath ); 
        }
        
        // Load them, build the I18n instances and register them in the options.dictionary
        zpt.i18nHelper.loadAsync( filePaths , function( i18nMap ){
            var i18nArray = [];
            for ( var c = 0; c < filePaths.length; c++ ) {
                var filePath = filePaths[ c ];
                var i18n =  new zpt.I18n( options.i18n.language, i18nMap[ filePath ] );
                i18nArray.push( i18n );
            }
            context.setI18nArray( i18nArray, options );
            context.initZPT({
                root: options.body,
                dictionary: options.dictionary,
                declaredRemotePageUrls: options.allDeclaredRemotePageUrls,
                callback: function(){
                    callback( options );
                }
            });
        });
    };
    
    // Init options
    var options = $.extend( true, {}, defaultOptions, userOptions );
    
    // Register all field managers
    fieldBuilder.registerAll( options.fieldsConfig.managers );
    context.setFieldBuilder( fieldBuilder );
    
    // Normalize options
    normalizer.run( options );
    
    // Configure ZPT
    zpt.context.getConf().loggingOn = options.logging.isOn;
    zpt.context.getConf().loggingLevel = options.logging.level;
    
    log.info( 'Initializing ZCrud...' );
    
    // Init I18n
    initI18n();
    
    log.info( '...ZCrud initialized.' );
    
    return options;
};

exports.load = function( options, data, callback ){

    log.info( 'Showing list...' );
    
    var listPage =  new ListPage( options, data );
    context.putPage( listPage.getId(), listPage );
    listPage.show( true, undefined, undefined, callback );
    
    log.info( '...showing list finished.' );
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
    listPage.selectRecords( rows );
};

exports.deselectRecords = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.deselectRecords( rows );
};

exports.selectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.selectRows( rows );
};

exports.deselectRows = function( listPageIdSource, rows ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    listPage.deselectRows( rows );
};

exports.getSelectedRows = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSelectedRows();
};

exports.getSelectedRecords = function( listPageIdSource ){

    var listPage = context.getListPage( listPageIdSource );
    if ( ! listPage ){
        alert( 'No list found using that source:' + listPageIdSource );
        return;
    }
    return listPage.getSelectedRecords();
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
    
    return listPage.instanceNewForm( type, data.record );
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
