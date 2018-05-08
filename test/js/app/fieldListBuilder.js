"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var fieldBuilder = require( '../../../js/app/fields/fieldBuilder.js' );
var Qunit = require( 'qunit' );
var testUtils = require( './testUtils.js' );
var testHelper = require( './testHelper.js' );
var fieldListBuilder = require( '../../../js/app/fieldListBuilder.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var options = undefined;

var buildIdsArray = function( fieldsArray ){
    
    var result = [];
    
    for ( var c = 0; c < fieldsArray.length; ++c ){
        var item = fieldsArray[ c ];
        
        if ( item.type == "fieldContainer" ){
            var container = result[ result.length - 1 ];
            if ( ! container || container.containerCounter != item.containerCounter ){
                container = {
                    type: item.type,
                    id: item.id,
                    containerCounter: item.containerCounter,
                    tag: item.tag,
                    template: item.template,
                    fields: []
                };
                result.push( container );
            }
            container.fields = buildIdsArray( item.fields );
            
        } else {
            result.push( item.id );
        }
    }
    
    return result;
};

// Run tests
QUnit.test( "Field list from general fields builder test", function( assert ) {
    
    var done = assert.async();
    options = defaultTestOptions;
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );
            
            // Empty array
            var items = [];
            var expected = [];
            var fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( fields, expected );
            
            // Strings only
            items = [ 'name', 'description' ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%",
                    "customOptions": {},
                    "elementId": "zcrud-name",
                    "elementName": "name",
                    "formFieldAttributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    },
                    "customOptions": {},
                    "elementId": "zcrud-description",
                    "elementName": "description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( fields, expected );
            
            // Fields only
            items = [ 
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%"
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    }
                }
            ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%",
                    "customOptions": {},
                    "elementId": "zcrud-name",
                    "elementName": "name",
                    "formFieldAttributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    },
                    "customOptions": {},
                    "elementId": "zcrud-description",
                    "elementName": "description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( fields, expected );
            
            // A fieldSubset only (with all default fields)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default"
                }
            ];
            expected = [
                "id",
                "name",
                "description",
                "date",
                "time",
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser",
                "important",
                "number"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );

            // A fieldSubset only (starting with datetime)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "start": "datetime"
                }
            ];
            expected = [
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser",
                "important",
                "number"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (ending with phoneType)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "end": "phoneType"
                }
            ];
            expected = [
                "id",
                "name",
                "description",
                "date",
                "time",
                "datetime",
                "phoneType"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (starting with description and ending with browser)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "start": "description",
                    "end": "browser"
                }
            ];
            expected = [
                "description",
                "date",
                "time",
                "datetime",
                "phoneType",
                "province",
                "city",
                "browser"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (starting with description and ending with browser except time and phoneType)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "default",
                    "start": "description",
                    "end": "browser",
                    "except": [ "time", "phoneType" ]
                }
            ];
            expected = [
                "description",
                "date",
                "datetime",
                "province",
                "city",
                "browser"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            done();
        }
    );
});

QUnit.test( "Field list from page id builder test", function( assert ) {

    var done = assert.async();
    options = {
        entityId: 'department',
        saveUserPreferences: false,

        pageConf: {
            defaultPageConf: {
                url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
            },
            pages: {
                list: {
                    url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                    fields: [ 'id', 'name' ],
                }, 
                create: {
                    fields: [
                        {
                            "type": "fieldSubset",
                            "source": "list"
                        },
                        'name2'
                    ],
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldSubset",
                            "source": "list"
                        },
                        'name3'
                    ],
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldSubset",
                            "source": "update"
                        },
                        'name4'
                    ],
                }
            }
        },
        
        key : 'id',
        fields: {
            id: {
                //key: true,
                sorting: false
            },
            name: {
                width: '10%'
            },
            name2: {
                width: '20%'
            },
            name3: {
                width: '30%'
            },
            name4: {
                width: '40%'
            }
        },
        
        ajax: {
            ajaxFunction: testUtils.ajax    
        },
        
        i18n: {
            language: 'en',
            filesPath: 'i18n',
            i18nArrayVarName: 'i18nArray',
            files: { 
                en: [ 'en-common.json', 'en-services.json' ],
                es: [ 'es-common.json', 'es-services.json' ] 
            }
        }
    };
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // A fieldSubset only (with all default fields)
            var items = [ 
                {
                    "type": "fieldSubset",
                    "source": "list"
                }
            ];
            var expected = [
                "id",
                "name"
            ];
            var fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only (with all default fields except name)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "list",
                    "except": [ "name" ]
                }
            ];
            expected = [
                "id"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only already built
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "create"
                }
            ];
            expected = [
                "id",
                "name",
                "name2"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldSubset only not built
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "delete"
                }
            ];
            expected = [
                "id",
                "name",
                "name3",
                "name4"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            done();
        }
    );
});

QUnit.test( "Field list from page id builder with circular references test", function( assert ) {

    var done = assert.async();
    options = {
        entityId: 'department',
        saveUserPreferences: false,

        pageConf: {
            defaultPageConf: {
                url: 'http://localhost/CRUDManager.do?cmd=BATCH_UPDATE&table=department'
            },
            pages: {
                list: {
                    url: 'http://localhost/CRUDManager.do?cmd=LIST&table=department',
                    fields: [ 'id', 'name' ],
                }, 
                create: {
                    fields: [
                        {
                            "type": "fieldSubset",
                            "source": "create"
                        }
                    ],
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldSubset",
                            "source": "delete"
                        }
                    ],
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldSubset",
                            "source": "update"
                        }
                    ],
                }
            }
        },
        
        key : 'id',
        fields: {
            id: {
                //key: true,
                sorting: false
            },
            name: {
                width: '10%'
            },
            name2: {
                width: '20%'
            },
            name3: {
                width: '30%'
            },
            name4: {
                width: '40%'
            }
        },

        ajax: {
            ajaxFunction: testUtils.ajax    
        },

        i18n: {
            language: 'en',
            filesPath: 'i18n',
            i18nArrayVarName: 'i18nArray',
            files: { 
                en: [ 'en-common.json', 'en-services.json' ],
                es: [ 'es-common.json', 'es-services.json' ] 
            }
        }
    };

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // A fieldSubset only (circular reference)
            var items = [ 
                {
                    "type": "fieldSubset",
                    "source": "create"
                }
            ];
            var errors = 0;
            try {
                var fields = fieldListBuilder.build( items, options ).fieldsArray;
            } catch ( e ) {
                ++errors;
            }
            assert.equal( errors, 1 );
            
            // A fieldSubset only (circular reference)
            items = [ 
                {
                    "type": "fieldSubset",
                    "source": "update"
                }
            ];
            errors = 0;
            try {
                fields = fieldListBuilder.build( items, options ).fieldsArray;
            } catch ( e ) {
                ++errors;
            }
            assert.equal( errors, 1 );
            
            done();
        }
    );
});

QUnit.test( "Field list from general fields with fieldContainer builder test", function( assert ) {

    var done = assert.async();
    options = defaultTestOptions;

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            // A fieldContainer only (with all default fields)
            var items = [ 
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "tag": "fieldSet",
                    "contents": [ 'name', 'description' ]
                }
            ];
            var expected = [
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%",
                    "customOptions": {},
                    "elementId": "zcrud-name",
                    "elementName": "name",
                    "formFieldAttributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    },
                    "customOptions": {},
                    "elementId": "zcrud-description",
                    "elementName": "description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            var expectedView = [
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerCounter": 1,
                    "tag": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "fields": expected
                }
            ];
            
            var fullObjectFields = fieldListBuilder.build( items, options );
            assert.deepEqual( fullObjectFields.fieldsArray, expected );
            assert.deepEqual( fullObjectFields.view, expectedView );
            
            // A fieldContainer only (with fields only)
            items = [ 
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "tag": "fieldSet",
                    "contents": [ 
                        {
                            "id": "name",
                            "type": "text",
                            "width": "90%"
                        },
                        {
                            "id": "description",
                            "type": "textarea",
                            "formFieldAttributes": {
                                "cols": 80,
                                "rows": 6
                            }
                        }
                    ]
                }
            ];
            expected = [
                {
                    "id": "name",
                    "type": "text",
                    "width": "90%",
                    "customOptions": {},
                    "elementId": "zcrud-name",
                    "elementName": "name",
                    "formFieldAttributes": {},
                    "name": "name",
                    "sorting": true,
                    "template": "text@templates/fields/basic.html",
                    "viewTemplate": undefined
                },
                {
                    "id": "description",
                    "type": "textarea",
                    "formFieldAttributes": {
                        "cols": 80,
                        "rows": 6
                    },
                    "customOptions": {},
                    "elementId": "zcrud-description",
                    "elementName": "description",
                    "name": "description",
                    "sorting": true,
                    "template": "textarea@templates/fields/basic.html",
                    "viewTemplate": undefined
                }
            ];
            expectedView = [
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerCounter": 2,
                    "tag": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "fields": expected
                }
            ];
            fullObjectFields = fieldListBuilder.build( items, options );
            assert.deepEqual( fullObjectFields.fieldsArray, expected );
            assert.deepEqual( fullObjectFields.view, expectedView );
            
            // A fieldContainer only (with a fieldSubset only starting with description and ending with browser except time and phoneType)
            items = [ 
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "tag": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "contents": [ 
                        {
                            "type": "fieldSubset",
                            "source": "default",
                            "start": "description",
                            "end": "browser",
                            "except": [ "time", "phoneType" ]
                        }
                    ]
                }
            ];
            expected = [
                "description",
                "date",
                "datetime",
                "province",
                "city",
                "browser"
            ];
            expectedView = [
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerCounter": 3,
                    "tag": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "fields": expected
                }
            ];
            
            fullObjectFields = fieldListBuilder.build( items, options );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.fieldsArray ), 
                expected );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.view ), 
                expectedView );
            
            // A string and a fieldContainer (with a fieldSubset only starting with description and ending with browser except time and phoneType)
            items = [ 
                'id',
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "tag": "div",
                    "contents": [ 
                        {
                            "type": "fieldSubset",
                            "source": "default",
                            "start": "description",
                            "end": "browser",
                            "except": [ "time", "phoneType" ]
                        }
                    ]
                }
            ];
            expected = [
                "id",
                "description",
                "date",
                "datetime",
                "province",
                "city",
                "browser"
            ];
            expectedView = [
                "id",
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerCounter": 4,
                    "tag": "div",
                    "template": "div@templates/containers/basic.html",
                    "fields": [
                        "description",
                        "date",
                        "datetime",
                        "province",
                        "city",
                        "browser"
                    ]
                }
            ];
            fullObjectFields = fieldListBuilder.build( items, options );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.fieldsArray ), 
                expected );
            assert.deepEqual( 
                buildIdsArray( fullObjectFields.view ), 
                expectedView );
            
            done();
        }
    );
});
