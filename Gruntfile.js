'use strict';
module.exports = function(grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt);
    require('load-grunt-config')(grunt);

    grunt.registerTask('build', ['exec']);
    grunt.registerTask('test', function() { return true; });

    grunt.registerTask('lint', ['jshint', 'jscs']);
    grunt.registerTask('default', ['build', 'lint', 'test']);
};
