// System Objects
var cp = require("child_process");
var path = require("path");

// Third Party Dependencies
var tags = require("common-tags");


module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    nodeunit: {
      tests: [
        "test/tessel-io.js"
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
  grunt.loadNpmTasks("grunt-git-authors");

  grunt.registerTask("default", ["jshint", "jscs", "nodeunit"]);



  grunt.registerTask("changelog", "`changelog:0.0.0--0.0.2` or `changelog`", (range) => {
    var done = grunt.task.current.async();

    if (!range) {
      // grunt changelog
      range = cp.execSync("git tag --sort version:refname").toString().split("\n");
    } else {
      // grunt changelog:previous--present
      range = range.split("--");
    }

    range = range.filter(Boolean).reverse();

    cp.exec(`git log --format="|%h|%s|" ${range[1]}..${range[0]}`, (error, result) => {
      if (error) {
        console.log(error.message);
        return;
      }

      var rows = result.split("\n").filter(commit => {
        return !commit.includes("|Merge ") && !commit.includes(range[0]);
      }).join("\n");

      // Extra whitespace above and below makes it easier to quickly copy/paste from terminal
      grunt.log.writeln(`\n\n${changelog(rows)}\n\n`);

      done();
    });
  });

};

function changelog(rows) {
  return tags.stripIndent `
| Commit | Message/Description |
| ------ | ------------------- |
${rows}
`;
}

