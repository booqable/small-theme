module.exports = {
  plugins: [
    // Remove unnecessary metadata
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',

    // Remove unused elements
    'removeUselessDefs',
    'removeEmptyAttrs',
    'removeEmptyText',
    'removeEmptyContainers',
    'removeUnknownsAndDefaults',

    // Optimize paths and shapes
    'convertShapeToPath',
    'mergePaths',
    'convertPathData',
    'removeUselessStrokeAndFill',

    // Clean up structure
    'cleanupAttrs',
    'cleanupNumericValues',
    'cleanupListOfValues',
    'convertStyleToAttrs',
    'removeStyleElement',

    // Optimize for size
    'collapseGroups',
    'moveElemsAttrsToGroup',
    'moveGroupAttrsToElems',
    'sortAttrs',

    // Transform optimizations
    'removeOffCanvasPaths',
    'reusePaths'
  ]
}