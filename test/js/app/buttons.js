'use strict';

//var $ = require( 'zzdom' );
//var zcrud = require( '../../../js/app/main.js' );
var zzDOM = require( '../../../js/app/zzDOMPlugin.js' );
var $ = zzDOM.zz;
var Qunit = require( 'qunit' );
var utils = require( '../../../js/app/utils.js' );
var testHelper = require( './testHelper.js' );
var testServerSide = require( './testServerSide.js' );

var defaultTestOptions = require( './defaultTestOptions.js' );
var subformTestOptions = require( './subformTestOptions.js' );
//var editableListTestOptions = require( './editableListTestOptions.js' );
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

var errorFunctionCounter = 0;
var errorFunction = function( message ){
    ++errorFunctionCounter;
};

// Run tests

QUnit.test( 'listToolbar (binding using listCreated method) test', function( assert ) {

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
                $( 'button.customButton1' ).on( 'click',  clickEventFunction1 );
                $( 'button.customButton2' ).on( 'click',  clickEventFunction2 );
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );
    
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
            
            $( 'button.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );
            
            $( 'button.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );
            
            done();
        }
    );
});

QUnit.test( 'listToolbar (binding automatically) test', function( assert ) {

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
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

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

            $( 'button.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( 'listByRow (binding using listCreated method) test', function( assert ) {

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
                $( 'button.customButton1' ).on( 'click',  clickEventFunction1 );
                $( 'button.customButton2' ).on( 'click',  clickEventFunction2 );
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

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

QUnit.test( 'listByRow (binding automatically) test', function( assert ) {

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
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

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

QUnit.test( 'formToolbar (binding using listCreated method) test', function( assert ) {

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
                $( 'button.customButton1' ).on( 'click',  clickEventFunction1 );
                $( 'button.customButton2' ).on( 'click',  clickEventFunction2 );
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

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

            $( 'button.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );
            
            done();
        }
    );
});

QUnit.test( 'formToolbar (binding automatically) test', function( assert ) {

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
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );

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

            $( 'button.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( 'subformToolbar (binding using listCreated method) test', function( assert ) {

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
                $( 'button.customButton1' ).on( 'click',  clickEventFunction1 );
                $( 'button.customButton2' ).on( 'click',  clickEventFunction2 );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );

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
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );
            
            // Go to edit form
            testHelper.clickUpdateListButton( key );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );
            
            $( 'button.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( 'subformToolbar (binding automatically) test', function( assert ) {

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
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );

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
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

            // Go to edit form
            testHelper.clickUpdateListButton( key );

            assert.equal( runCounter1, 0 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton1' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 0 );

            $( 'button.customButton2' ).trigger( 'click' );
            assert.equal( runCounter1, 1 );
            assert.equal( runCounter2, 1 );

            done();
        }
    );
});

QUnit.test( 'subformByRow (binding using listCreated method) test', function( assert ) {

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
                $( 'button.customButton1' ).on( 'click',  clickEventFunction1 );
                $( 'button.customButton2' ).on( 'click',  clickEventFunction2 );
            }
        }
    };
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );

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
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

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

QUnit.test( 'subformByRow (binding automatically) test', function( assert ) {

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
    options = utils.extend( true, {}, subformTestOptions, thisTestOptions );

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
                'id': '' + key,
                'name': 'Service ' + key,
                'members': [
                    {
                        'code': '1',
                        'name': 'Bart Simpson',
                        'description': 'Description of Bart Simpson'
                    },
                    {
                        'code': '2',
                        'name': 'Lisa Simpson',
                        'description': 'Description of Lisa Simpson'
                    }
                ]
            };
            testServerSide.setService( key, record );

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

QUnit.test( 'unknown button in listToolbar test', function( assert ) {

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
                $( 'button.customButton1' ).on( 'click',  clickEventFunction1 );
            }
        }
    };
    options = utils.extend( true, {}, defaultTestOptions, thisTestOptions );
    options.logging.isOn = false;
    options.errorFunction = errorFunction;

    var done = assert.async();
    
    $( '#departmentsContainer' ).zcrud( 
        'init',
        options,
        function( options ){
            assert.equal( errorFunctionCounter, 0 );
            $( '#departmentsContainer' ).zcrud( 'renderList' );
            assert.equal( errorFunctionCounter, 1 );
            
            done();
        }
    );
});
