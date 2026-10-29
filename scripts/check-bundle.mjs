import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = process.cwd()
const DIST = join(ROOT, 'dist')

function collectFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...collectFiles(path))
    else files.push(path)
  }
  return files
}

const files = collectFiles(DIST)
const suspicious = [/sk-[A-Za-z0-9]{20,}/, /AIza[0-9A-Za-z_-]{35}/, /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/]
let failed = false

for (const file of files) {
  if (file.endsWith('.map')) {
    console.error(`Source map found in bundle: ${file}`)
    failed = true
    continue
  }
  const content = readFileSync(file, 'utf8')
  for (const pattern of suspicious) {
    if (pattern.test(content)) {
      console.error(`Potential secret pattern ${pattern} found in ${file}`)
      failed = true
    }
  }
}

if (failed) {
  process.exit(1)
}

console.log(`Bundle check passed: ${files.length} files scanned.`)