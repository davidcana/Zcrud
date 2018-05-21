"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
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
            if ( ! container || container.id != item.id ){
                container = {
                    type: item.type,
                    id: item.id,
                    containerType: item.containerType,
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
            
            // A fieldsGroup only (with all default fields)
            items = [ 
                {
                    "type": "fieldsGroup",
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
            
            // A fieldsGroup only (starting with datetime)
            items = [ 
                {
                    "type": "fieldsGroup",
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
            
            // A fieldsGroup only (ending with phoneType)
            items = [ 
                {
                    "type": "fieldsGroup",
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
            
            // A fieldsGroup only (starting with description and ending with browser)
            items = [ 
                {
                    "type": "fieldsGroup",
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
            
            // A fieldsGroup only (starting with description and ending with browser except time and phoneType)
            items = [ 
                {
                    "type": "fieldsGroup",
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
                            "type": "fieldsGroup",
                            "source": "list"
                        },
                        'name2'
                    ],
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "list"
                        },
                        'name3'
                    ],
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldsGroup",
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

            // A fieldsGroup only (with all default fields)
            var items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "list"
                }
            ];
            var expected = [
                "id",
                "name"
            ];
            var fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only (with all default fields except name)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "list",
                    "except": [ "name" ]
                }
            ];
            expected = [
                "id"
            ];
            fields = fieldListBuilder.build( items, options ).fieldsArray;
            assert.deepEqual( buildIdsArray( fields ), expected );
            
            // A fieldsGroup only already built
            items = [ 
                {
                    "type": "fieldsGroup",
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
            
            // A fieldsGroup only not built
            items = [ 
                {
                    "type": "fieldsGroup",
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
                            "type": "fieldsGroup",
                            "source": "create"
                        }
                    ],
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "delete"
                        }
                    ],
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "update"
                        }
                    ],
                }
            }
        },
        
        key : 'id',
        fields: {
            id: {
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

            // A fieldsGroup only (circular reference)
            var items = [ 
                {
                    "type": "fieldsGroup",
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
            
            // A fieldsGroup only (circular reference)
            items = [ 
                {
                    "type": "fieldsGroup",
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
                    "type": "fieldsGroup",
                    "source": [ 'name', 'description' ],
                    "container": {
                        "id": "intro",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html"
                    }
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
                    "containerType": "fieldSet",
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
                    "type": "fieldsGroup",
                    "source": [ 
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
                    ],
                    "container": {
                        "id": "intro",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html"
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
            expectedView = [
                {
                    "type": "fieldContainer",
                    "id": "intro",
                    "containerType": "fieldSet",
                    "template": "fieldSet@templates/containers/basic.html",
                    "fields": expected
                }
            ];
            fullObjectFields = fieldListBuilder.build( items, options );
            assert.deepEqual( fullObjectFields.fieldsArray, expected );
            assert.deepEqual( fullObjectFields.view, expectedView );
            
            // A fieldContainer only (with a fieldsGroup only starting with description and ending with browser except time and phoneType)
            items = [ 
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "start": "description",
                    "end": "browser",
                    "except": [ "time", "phoneType" ],
                    "container": {
                        "id": "intro",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html"
                    }
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
                    "containerType": "fieldSet",
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
            
            // A string and a fieldContainer (with a fieldsGroup only starting with description and ending with browser except time and phoneType)
            items = [ 
                'id',
                {
                    "type": "fieldsGroup",
                    "source": "default",
                    "start": "description",
                    "end": "browser",
                    "except": [ "time", "phoneType" ],
                    "container": {
                        "id": "intro",
                        "containerType": "div",
                        "template": "fieldSet@templates/containers/basic.html"
                    }
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
                    "containerType": "div",
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

QUnit.test( "Field list from another view builder test", function( assert ) {
    
    var done = assert.async();
    var thisTestOptions = {
        pageConf: {
            pages: {
                create: {
                    fields: [
                        {
                            "type": "fieldsGroup"
                        }
                    ]
                }, 
                update: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": [ 
                                'id',
                                'name',
                                'description' 
                            ],
                            "container": {
                                "id": "basicData",
                                "containerType": "fieldSet"
                            }
                        },
                        {
                            "type": "fieldsGroup",
                            "source": "default",
                            "start": "date",
                            "end": "phoneType"
                        },
                        {
                            "type": "fieldsGroup",
                            "source": [ 
                                'province',
                                'city'
                            ],
                            "container": {
                                "id": "location",
                                "containerType": "fieldSet"
                            }
                        },
                        'browser',
                        'important'
                    ]
                }, 
                delete: {
                    fields: [
                        {
                            "type": "fieldsGroup",
                            "source": "update",
                            "except": [ 'time' ],
                            "end": "location"
                        }
                    ]
                }
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'load' );

            var expected = 	
                [
                    "id",
                    "name",
                    "description",
                    "date",
                    "datetime",
                    "phoneType",
                    "province",
                    "city"
                ];
            var expectedView = 
                [
                    {
                        "fields": [
                            "id",
                            "name",
                            "description"
                        ],
                        "id": "basicData",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html",
                        "type": "fieldContainer"
                    },
                    "date",
                    "datetime",
                    "phoneType",
                    {
                        "fields": [
                            "province",
                            "city"
                        ],
                        "id": "location",
                        "containerType": "fieldSet",
                        "template": "fieldSet@templates/containers/basic.html",
                        "type": "fieldContainer"
                    }
                ];
            var fullObjectFields = fieldListBuilder.get( 'delete', options );
            
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
