const fs = require('fs')
const path = require('path')
const { optimize } = require('svgo')

const svgoConfig = {
  plugins: [
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'cleanupNumericValues',
    'convertPathData',
    'removeEmptyAttrs',
    'removeUselessStrokeAndFill',
    'cleanupListOfValues',
    'sortAttrs'
  ]
}

const optimizeSvgFiles = (srcDir, destDir) => {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }

  const files = fs.readdirSync(srcDir)

  files.forEach(file => {
    // Skip the _utils directory
    if (file === '_utils') return

    if (file.endsWith('.liquid')) {
      const srcPath = path.join(srcDir, file)
      const destPath = path.join(destDir, file)

      let content = fs.readFileSync(srcPath, 'utf8')

      try {
        // Optimize the SVG content
        const result = optimize(content, svgoConfig)
        const optimizedContent = result.data

        fs.writeFileSync(destPath, optimizedContent)

        const originalSize = Buffer.byteLength(content, 'utf8')
        const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8')
        const reduction = ((originalSize - optimizedSize) / originalSize * 100).toFixed(1)

        console.log(`${file}: ${originalSize} → ${optimizedSize} bytes (${reduction}% reduction)`)
      } catch (error) {
        console.error(`Error optimizing ${file}:`, error.message)
        // Fallback: copy original file
        fs.copyFileSync(srcPath, destPath)
      }
    }
  })
}

// Run the optimization
const srcDir = path.resolve(__dirname, '..')
const destDir = path.resolve(__dirname, '../../../snippets')
optimizeSvgFiles(srcDir, destDir)
