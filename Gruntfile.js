module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON( 'package.json' ),
        qunit: {
            files: [ 'test/**/*.html', '!test/index.html' ]
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
