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
        "test/index.js"
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



  grunt.registerTask('changelog', '"changelog", "changelog:v0.0.0..v0.0.2" or "changelog:v0.0.0"', (arg) => {
    var done = grunt.task.current.async();
    var tags = cp.execSync('git tag --sort version:refname').toString().split('\n');
    var tagIndex = -1;
    var range;
    var revisionRange;

    if (!arg) {
      // grunt changelog
      range = tags.filter(Boolean).slice(-2);
    } else {
      if (arg.includes('..')) {
        // grunt changelog:<revision-range>
        if (!arg.startsWith('v') || !arg.includes('..v')) {
          range = arg.split('..').map(tag => tag.startsWith('v') ? tag : `v${tag}`);
        } else {
          // arg is a well formed <revision-range>
          revisionRange = arg;
        }
      } else {
        // grunt changelog:<revision>
        if (!arg.startsWith('v')) {
          arg = `v${arg}`;
        }

        tagIndex = tags.indexOf(arg);
        range = [tags[tagIndex - 1], tags[tagIndex]];
      }
    }

    if (!range && revisionRange) {
      range = revisionRange.split('..');
    }

    if (!revisionRange && (range && range.length)) {
      revisionRange = `${range[0]}..${range[1]}`;
    }

    cp.exec(`git log --format='|%h|%s|' ${revisionRange}`, (error, result) => {
      if (error) {
        console.log(error.message);
        return;
      }

      var rows = result.split('\n').filter(commit => {
        return !commit.includes('|Merge ') && !commit.includes(range[0]);
      });

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
${rows.join('\n')}
`;
}


