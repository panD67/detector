import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { readdirSync } from 'node:fs'

const ROOT = process.cwd()
const BASELINE_PATH = join(ROOT, 'data/prompt-baseline.json')

function collectSourceFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(join(directory, entry.name)))
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      files.push(join(directory, entry.name))
    }
  }
  return files
}

const versions = {}
for (const file of collectSourceFiles(join(ROOT, 'src'))) {
  const content = readFileSync(file, 'utf8')
  const matches = content.matchAll(/export const (\w*PROMPT_VERSION)\s*=\s*'([^']+)'/g)
  for (const match of matches) {
    versions[match[1]] = match[2]
  }
}

if (!existsSync(BASELINE_PATH)) {
  writeFileSync(BASELINE_PATH, JSON.stringify(versions, null, 2))
  console.log('Prompt baseline created.')
  console.log(JSON.stringify(versions, null, 2))
  process.exit(0)
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
let changed = false
for (const [key, value] of Object.entries(versions)) {
  if (baseline[key] !== value) {
    changed = true
    console.error(`Prompt version changed: ${key} ${baseline[key]} -> ${value}`)
  }
}
if (changed) {
  console.error('Prompt regression detected.')
  process.exit(1)
}
console.log('Prompt versions unchanged.')