module.exports = function (config) {
    config.set({
                   frameworks: ["jasmine", "karma-typescript"],

                   files: [
                       {pattern: "src/**/*.js.map", included: false},
                       {pattern: "spec/**/*.js.map", included: false},
                       {pattern: "src/**/*.ts"},
                       {pattern: "spec/**/*.ts"},
                       {pattern: "spec/elementData/*", included: false},
                   ],

                   mime: {
                       "text/x-typescript": ["ts", "tsx"]
                   },

                   preprocessors: {
                       "src/**/*.ts": ["karma-typescript"],
                       "spec/**/*.ts": ["karma-typescript"]
                   },

                   reporters: ["progress", "karma-typescript"],

                   browsers: ["Chrome"],

                   coverageReporter: {
                       type: "none"
                   },

                   karmaTypescriptConfig: {
                       bundlerOptions: {
                           resolve: {
                               //extensions: [".ts", ".js", ".json", ".tsx"]
                           }
                       },
                       coverageOptions: {
                           instrumentation: false
                       }
                   },

               });
};
