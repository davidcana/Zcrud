"use strict";

var $ = require( 'jquery' );
var zcrud = require( '../../../js/app/main.js' );
require( '../../../js/app/jqueryPlugin.js' );
var Qunit = require( 'qunit' );
var testHelper = require( './testHelper.js' );
var testUtils = require( './testUtils.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
var editableListTestOptions = require( './editableListTestOptions.js' );
var thisTestOptions = undefined;
var options = undefined;

var runCounter1 = 0;
var clickEventFunction1 = function( event ){
    
    event.preventDefault();
    event.stopPropagation();
    
    ++runCounter1;
};

var runCounter2 = 0;
var clickEventFunction2 = function( event ){
    
    event.preventDefault();
    event.stopPropagation();
    
    ++runCounter2;
};

var alertFunction = function( event ){
    alert( 'It worked!' );
};

// Run tests

QUnit.test( "listToolbar (binding using listCreated method) test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    buttons: {
                        toolbar: [ 
                            'list_showCreateForm',
                            {
                                type: 'generic',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 1'
                                    }  
                                }
                            },
                            {
                                type: 'generic',
                                cssClass: 'customButton2',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 2'
                                    }  
                                }
                            }
                        ],
                        byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
                    }
                }
            },
        },
        events: {
            listCreated: function ( data ) {
                $( 'button.customButton1' ).click( clickEventFunction1 );
                $( 'button.customButton2' ).click( clickEventFunction2 );
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
    
    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;
    
    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );
            
            $( 'button.customButton1' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );
            
            $( 'button.customButton2' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );
            
            done();
        }
    );
});

QUnit.test( "listToolbar (binding automatically) test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    buttons: {
                        toolbar: [ 
                            'list_showCreateForm',
                            {
                                type: 'generic',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 1'
                                    }
                                },
                                run: clickEventFunction1
                            },
                            {
                                type: 'generic',
                                cssClass: 'customButton2',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 2'
                                    }
                                },
                                run: clickEventFunction2
                            }
                        ],
                        byRow: [ 'list_showEditForm', 'list_showDeleteForm' ]
                    }
                }
            },
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;
    
    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton1' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( "listByRow (binding using listCreated method) test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    buttons: {
                        byRow: [ 
                            'list_showEditForm', 
                            'list_showDeleteForm',
                            {
                                type: 'generic',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 1'
                                    }  
                                }
                            },
                            {
                                type: 'generic',
                                cssClass: 'customButton2',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 2'
                                    }  
                                }
                            }
                        ]
                    }
                }
            },
        },
        events: {
            listCreated: function ( data ) {
                $( 'button.customButton1' ).click( clickEventFunction1 );
                $( 'button.customButton2' ).click( clickEventFunction2 );
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );
            
            testHelper.getLastRow().find( '.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            testHelper.getLastRow().find( '.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );
            
            done();
        }
    );
});

QUnit.test( "listByRow (binding automatically) test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    buttons: {
                        byRow: [ 
                            'list_showEditForm', 
                            'list_showDeleteForm',
                            {
                                type: 'generic',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 1'
                                    }  
                                },
                                run: clickEventFunction1
                            },
                            {
                                type: 'generic',
                                cssClass: 'customButton2',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 2'
                                    }  
                                },
                                run: clickEventFunction2
                            }
                        ]
                    }
                }
            },
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            testHelper.getLastRow().find( '.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            testHelper.getLastRow().find( '.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( "formToolbar (binding using listCreated method) test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: [ 
                            'undo', 
                            'redo', 
                            'form_cancel', 
                            'form_submit',
                            {
                                type: 'generic',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 1'
                                    }  
                                }
                            },
                            {
                                type: 'generic',
                                cssClass: 'customButton2',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 2'
                                    }  
                                }
                            }
                        ]
                    }
                }
            },
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.customButton1' ).click( clickEventFunction1 );
                $( 'button.customButton2' ).click( clickEventFunction2 );
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            
            // Go to edit form
            var key = 2;
            testHelper.clickUpdateListButton( key );
            
            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton1' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );
            
            done();
        }
    );
});

QUnit.test( "formToolbar (binding automatically) test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                update: {
                    buttons: {
                        toolbar: [ 
                            'undo', 
                            'redo', 
                            'form_cancel', 
                            'form_submit',
                            {
                                type: 'generic',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 1'
                                    }  
                                },
                                run: clickEventFunction1
                            },
                            {
                                type: 'generic',
                                cssClass: 'customButton2',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Custom toolbar button 2'
                                    }  
                                },
                                run: clickEventFunction2
                            }
                        ]
                    }
                }
            },
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            // Go to edit form
            var key = 2;
            testHelper.clickUpdateListButton( key );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton1' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( "subformToolbar (binding using listCreated method) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                buttons: {
                    toolbar: [ 
                        'subform_addNewRow',
                        {
                            type: 'generic',
                            cssClass: 'customButton1',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 1'
                                }  
                            }
                        },
                        {
                            type: 'generic',
                            cssClass: 'customButton2',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 2'
                                }
                            }
                        }
                    ]
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.customButton1' ).click( clickEventFunction1 );
                $( 'button.customButton2' ).click( clickEventFunction2 );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            //
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );
            
            $( 'button.customButton1' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( "subformToolbar (binding automatically) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                buttons: {
                    toolbar: [ 
                        'subform_addNewRow',
                        {
                            type: 'generic',
                            cssClass: 'customButton1',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 1'
                                }  
                            },
                            run: clickEventFunction1
                        },
                        {
                            type: 'generic',
                            cssClass: 'customButton2',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 2'
                                }
                            },
                            run: clickEventFunction2
                        }
                    ]
                }
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            //
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton1' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).click();
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( "subformByRow (binding using listCreated method) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                buttons: {
                    byRow: [ 
                        'subform_deleteRow',
                        {
                            type: 'generic',
                            cssClass: 'customButton1',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 1'
                                }  
                            }
                        },
                        {
                            type: 'generic',
                            cssClass: 'customButton2',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 2'
                                }
                            }
                        }
                    ]
                }
            }
        },
        events: {
            formCreated: function ( data ) {
                $( 'button.customButton1' ).click( clickEventFunction1 );
                $( 'button.customButton2' ).click( clickEventFunction2 );
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            //
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            testHelper.getSubformLastRow( 'members' ).find( '.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            testHelper.getSubformLastRow( 'members' ).find( '.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( "subformByRow (binding automatically) test", function( assert ) {

    thisTestOptions = {
        fields: {
            members: {
                buttons: {
                    byRow: [ 
                        'subform_deleteRow',
                        {
                            type: 'generic',
                            cssClass: 'customButton1',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 1'
                                }  
                            },
                            run: clickEventFunction1
                        },
                        {
                            type: 'generic',
                            cssClass: 'customButton2',
                            textsBundle: {
                                title: undefined,
                                content: {
                                    translate: false,
                                    text: 'Custom toolbar button 2'
                                }
                            },
                            run: clickEventFunction2
                        }
                    ]
                }
            }
        }
    };
    options = $.extend( true, {}, subformTestOptions, thisTestOptions );

    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();

    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            $( '#departmentsContainer' ).zcrud( 'renderList' );

            //
            var key = 4;
            var record =  {
                "id": "" + key,
                "name": "Service " + key,
                "members": [
                    {
                        "code": "1",
                        "name": "Bart Simpson",
                        "description": "Description of Bart Simpson"
                    },
                    {
                        "code": "2",
                        "name": "Lisa Simpson",
                        "description": "Description of Lisa Simpson"
                    }
                ]
            };
            testUtils.setService( key, record );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            testHelper.getSubformLastRow( 'members' ).find( '.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            testHelper.getSubformLastRow( 'members' ).find( '.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( "unknown button in listToolbar test", function( assert ) {

    thisTestOptions = {
        pageConf: {
            pages: {
                list: {
                    buttons: {
                        toolbar: [ 
                            'list_showCreateForm',
                            {
                                type: 'unknown',
                                cssClass: 'customButton1',
                                textsBundle: {
                                    title: undefined,
                                    content: {
                                        translate: false,
                                        text: 'Unknown toolbar button 1'
                                    }  
                                }
                            }
                        ]
                    }
                }
            },
        },
        events: {
            listCreated: function ( data ) {
                $( 'button.customButton1' ).click( clickEventFunction1 );
            }
        }
    };
    options = $.extend( true, {}, defaultTestOptions, thisTestOptions );
    options.logging.isOn = false;
    
    // Reset counters
    runCounter1 = 0;
    runCounter2 = 0;

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            assert.throws(
                function(){
                    $( '#departmentsContainer' ).zcrud( 'renderList' );
                }
            );
            done();
        }
    );
});
