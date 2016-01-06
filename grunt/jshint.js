'use strict';
module.exports = function(grunt) {
    return {
        all: [
            'src/**/*.js',
        ],
        options: {
            jshintrc: '.jshintrc',
        }
    };
};
