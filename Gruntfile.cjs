module.exports = function(grunt) {
    
    const sass = require('sass');
    //require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
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
                        src: ['**/*', '!**/*~', '!lib/zcrud-esm.js'],
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
        },
        copy: {
            zcrud: {
                src: 'dist/zcrud-esm.js',
                dest: 'docs/lib/zcrud-esm.js'
            },
            i18n: {
                expand: true,
                cwd: 'i18n/',
                dest: 'docs/i18n',
                src: '**'
            },
            templates: {
                src: 'templates/**',
                dest: 'docs/'
            },
            themes: {
                src: 'themes/**',
                dest: 'docs/'
            }
        },
        sass: {
            options: {
                implementation: sass,
                sourceMap: true
            },
            dist: {
                files: {
                    'themes/basic/theme.css': 'themes/basic/theme.scss',
                    'themes/soft/theme.css': 'themes/soft/theme.scss'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-sass');
    //grunt.registerTask('sass', ['sass']);
    //grunt.loadNpmTasks('grunt-contrib-sass');
};
