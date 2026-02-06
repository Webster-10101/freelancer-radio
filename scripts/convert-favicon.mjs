import { Resvg } from '@resvg/resvg-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const svgPath = path.join(projectRoot, 'public/favicon.svg')
const iconsDir = path.join(projectRoot, 'public/icons')

const svg = fs.readFileSync(svgPath, 'utf8')

const sizes = [192, 512]

for (const size of sizes) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size }
  })
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  const outPath = path.join(iconsDir, `icon-${size}.png`)
  fs.writeFileSync(outPath, pngBuffer)
  console.log(`Created ${outPath}`)
}
