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
        src: './hummingbird.litcoffee',
        dest: 'lib/hummingbird.litcoffee'
      }
    },
    browserify: {
      dist: {
        files: {
          'vendor.js': ['lib/vendor.js']
        },
        debug: true
      }
    },
    coffee:{
      dist: {
        files: {
          'hummingbird-core.js' : ['./lib/hummingbird.litcoffee', './lib/*.litcoffee']
        },
        options: {
          bare: true,
          sourceMap: false
        }
      }
    },
    concat: {
      dist: {
        src: ['vendor.js', 'hummingbird-core.js'],
        dest: 'hummingbird.js'
      }
    },
    watch: {
      dev: {
        files: ["lib/*", "!lib/hummingbird.litcoffee"],
        tasks: ['default'],
        options: {
          interrupt: true
        }
      }
    },
    clean: {
      dist: {
        src: ['./hummingbird.js', './hummingbird-core.js', './index.html', './vendor.js', './lib/hummingbird.litcoffee']
      }
    },
    shell: {
      docs: {
         options: {
           stdout: false,
           stderr: true
         },
        command: 'PATH="./node_modules/.bin:${PATH}" doc-n-toc ./intro.md ./lib/hummingbird.litcoffee ./lib/index.litcoffee ./lib/tokenizer.litcoffee ./lib/token_store.litcoffee --title "Hummingbird v<%= pkg.version %>" > ./index.html'
      },
      test: {
       options: {
         stdout: true,
         stderr: true
       },
      command: 'PATH="./node_modules/.bin:${PATH}" phantomjs test/env/runner.js http://localhost:8100/test'
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
  grunt.registerTask('dev', ['default',  'connect:dev', 'shell:test', 'watch']);
};
