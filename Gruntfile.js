module.exports = function(grunt) {

  var task = grunt.task;
  var file = grunt.file;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;
  var _ = grunt.util._;


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    nodeunit: {
      tests: [
        "test/tessel.js"
      ]
    },
    jshint: {
      options: {
        latedef: false,
        curly: true,
        eqeqeq: true,
        immed: true,
        newcap: false,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        strict: false,
        esnext: true,
        globals: {
          rewire: true,
          exports: true,
          document: true,
          Promise: true,
          WeakMap: true,
          Map: true,
          window: true,
          IS_TEST_MODE: true
        }
      },
      files: {
        src: [
          "Gruntfile.js",
          "lib/**/*.js",
          "test/**/*.js",
          "eg/**/*.js"
        ]
      }
    },
    jscs: {
      all: [
        "lib/**/*.js",
        "test/**/*.js",
        "Gruntfile.js",
      ],
      options: {
        config: ".jscsrc"
      }
    },

  });

  grunt.loadNpmTasks("grunt-contrib-nodeunit");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-jscs");

  grunt.registerTask("default", ["jshint", "jscs", "nodeunit"]);
};
