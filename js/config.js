require.config({
    baseUrl: 'js',
    deps: ['main'],
    enforceDefine: true,
    paths: {
        'd3': './lib/d3'
    }
});
define();