/*global module:false*/
module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
      ' Licensed <%= _.pluck(pkg.license, "type").join(", ") %> */\n',
    includereplace: {
      options: {
        globals: {
          VERSION: '<%= pkg.version %>',
          INDEX_VERSION: '<%= pkg.index_version %>'
        }
      },
      dist: {
        src: 'lib/hummingbird.litcoffee',
        dest: 'build/hummingbird.litcoffee'
      }
    },
    browserify: {
      dist: {
        files: {
          'build/vendor.js': ['lib/vendor.js']
        },
        debug: true
      }
    },
    coffee:{
      dist: {
        files: {
          'build/hummingbird-core.js' : ['build/hummingbird.litcoffee', 'lib/*.litcoffee', '!lib/hummingbird.litcoffee']
        },
        options: {
          bare: true,
          sourceMap: false
        }
      }
    },
    concat: {
      dist: {
        src: ['build/vendor.js', 'build/hummingbird-core.js'],
        dest: 'hummingbird.js'
      }
    },
    watch: {
      dev: {
        files: ["lib/*", "!lib/hummingbird.litcoffee", "docs/*"],
        tasks: ['default'],
        options: {
          interrupt: true
        }
      }
    },
    clean: {
      dist: {
        src: ['hummingbird.js', 'build/*', 'index.html']
      }
    },
    shell: {
      docs: {
         options: {
           stdout: false,
           stderr: true
         },
        command: 'PATH="node_modules/.bin:${PATH}" doc-n-toc docs/intro.md docs/examples.md docs/contribute.md --css docs/my.less --title "Hummingbird v<%= pkg.version %>" > index.html'
      }
    },
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8100/test',
          ]
        }
      }
    },
    connect: {
      dev: {
        options: {
          port: 8100,
          base: '.'
        }
      }
    }
  });

  // Default task
  grunt.registerTask('default', ['clean', 'includereplace', 'browserify', 'coffee', 'concat', 'shell:docs']);
  grunt.registerTask('dev', ['default',  'connect:dev', 'watch']);
  grunt.registerTask('test', ['default',  'connect:dev', 'qunit', 'watch']);
  grunt.registerTask('docs', ['shell:docs']);
};
