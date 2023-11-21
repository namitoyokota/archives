// using this configuration makes Terser optimizations quicker and avoids dangerous optimizations, while still
// significantly reducing code size.
module.exports = {
  mangle: true,
  compress: {
    sequences: false,
    properties: false,
    dead_code: false,
    conditionals: false,
    comparisons: false,
    evaluate: false,
    booleans: false,
    loops: false,
    unused: false,
    hoist_funs: false,
    hoist_vars: false,
    if_return: false,
    join_vars: false,
    warnings: true,
    negate_iife: false,
    pure_getters: false,
    drop_console: false,
    keep_fargs: true,
    keep_fnames: true // https://medium.com/@omril321/fixing-overly-aggressive-optimization-with-terser-f07309761b50
  }
};