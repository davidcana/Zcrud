module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        qunit: {
            files: [ 
                'test/*.html', '!test/index.html' 
            ]
        },
        watch: {
            files: [ 'js/app/*.js', 'test/js/app/*.js' ],
            tasks: [ 'browserify' ]
        },
        browserify: {
            standalone: {
                options: {
                    plugin: [
                        [ "browserify-derequire" ]
                    ],
                    browserifyOptions: {
                        standalone: 'zcrud'
                    }
                },
                src: 'js/app/main.js',
                dest: 'build/standalone.js'
            },
            sample: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/sample.js',
                dest: 'build/sample.js'
            },
            sampleEditable: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/sample-editable.js',
                dest: 'build/sample-editable.js'
            },
            sampleSubform: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/sample-subform.js',
                dest: 'build/sample-subform.js'
            },
            sampleContainer: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/sample-container.js',
                dest: 'build/sample-container.js'
            },
            paging: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/paging.js',
                dest: 'build/paging.js'
            },
            sorting: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/sorting.js',
                dest: 'build/sorting.js'
            },
            filtering: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/filtering.js',
                dest: 'build/filtering.js'
            },
            selecting: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/selecting.js',
                dest: 'build/selecting.js'
            },
            delete: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/delete.js',
                dest: 'build/delete.js'
            },
            create: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/create.js',
                dest: 'build/create.js'
            },
            update: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/update.js',
                dest: 'build/update.js'
            },
            editableListChange: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/editableList-change.js',
                dest: 'build/editableList-change.js'
            },
            editableListCreate: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/editableList-create.js',
                dest: 'build/editableList-create.js'
            },
            editableListDelete: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/editableList-delete.js',
                dest: 'build/editableList-delete.js'
            },
            editableListMixed: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/editableList-mixed.js',
                dest: 'build/editableList-mixed.js'
            },
            formHistory: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/formHistory.js',
                dest: 'build/formHistory.js'
            },
            editableListUpdateAllfields: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/editableList-update-allFields.js',
                dest: 'build/editableList-update-allFields.js'
            },
            editableListCreateAllfields: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/editableList-create-allFields.js',
                dest: 'build/editableList-create-allFields.js'
            },
            subformChange: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/subform-change.js',
                dest: 'build/subform-change.js'
            },
            subformCreate: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/subform-create.js',
                dest: 'build/subform-create.js'
            },
            subformDelete: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/subform-delete.js',
                dest: 'build/subform-delete.js'
            },
            subformMixed: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/subform-mixed.js',
                dest: 'build/subform-mixed.js'
            },
            subformUpdateAllFields: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/subform-update-allFields.js',
                dest: 'build/subform-update-allFields.js'
            },
            subformCreateAllFields: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/subform-create-allFields.js',
                dest: 'build/subform-create-allFields.js'
            },
            formsValidation: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/validation-forms.js',
                dest: 'build/validation-forms.js'
            },
            subformsValidation: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/validation-subforms.js',
                dest: 'build/validation-subforms.js'
            },
            editableListsValidation: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/validation-editableLists.js',
                dest: 'build/validation-editableLists.js'
            },
            events: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/events.js',
                dest: 'build/events.js'
            },
            methods: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/methods.js',
                dest: 'build/methods.js'
            },
            createAllfields: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/createAllfields.js',
                dest: 'build/createAllfields.js'
            },
            updateAllfields: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/updateAllfields.js',
                dest: 'build/updateAllfields.js'
            },
            serverSide: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/serverSide.js',
                dest: 'build/serverSide.js'
            },
            noKeyField: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/noKeyField.js',
                dest: 'build/noKeyField.js'
            },
            fieldListBuilder: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/fieldListBuilder.js',
                dest: 'build/fieldListBuilder.js'
            },
            json: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/json.js',
                dest: 'build/json.js'
            },
            forms: {
                options: {
                    browserifyOptions: {
                        debug: true
                    }
                },
                src: 'test/js/app/forms.js',
                dest: 'build/forms.js'
            }
        },
        compress: {
            main: {
                options: {
                    archive: 'dist/<%= pkg.name %>_<%= grunt.template.today("yyyy-mm-dd_HHMM") %>.tar.gz',
                    pretty: true
                },
                expand: true,
                files: [
                        {
                        cwd: 'test/',
                        expand: true,
                        src: ['**/*', '!**/*~'],
                        dest: 'test'
                        }, 
                        {
                        cwd: 'lib/',
                        expand: true,
                        src: ['**/*', '!**/*~'],
                        dest: 'lib'
                        }, 
                        {
                        cwd: 'js/',
                        expand: true,
                        src: ['**/*', '!**/*~'],
                        dest: 'js'
                        }, 
                        {
                        cwd: 'themes/',
                        expand: true,
                        src: ['**/*', '!**/*~'],
                        dest: 'themes'
                        },
                        {
                        cwd: 'docs/',
                        expand: true,
                        src: ['**/*', '!**/*~'],
                        dest: 'docs'
                        },
                        {
                        src: ['changes.txt']
                        },
                        {
                        src: ['CONTRIBUTORS.txt']
                        },
                        {
                        src: ['Gruntfile.js']
                        }, 
                        {
                        src: ['LICENSE.txt']
                        }, 
                        {
                        src: ['package.json']
                        },
                        {
                        src: ['README.md']
                        },
                        {
                        src: ['TODO.txt']
                        }
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-browserify');
    
    grunt.registerTask('test', ['qunit']);
    grunt.registerTask('default', ['browserify']);
};
