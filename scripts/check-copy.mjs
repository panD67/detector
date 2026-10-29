import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'

const ROOT = process.cwd()
const TARGET_DIRECTORIES = ['src', 'public', 'docs']
const TARGET_FILES = ['index.html', 'README.md']
const EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.html',
  '.md',
  '.json',
  '.svg',
])
const SKIP_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.git',
  'scripts',
])

const BANNED_PHRASES = [
  'revolusioner',
  'terbaik di kelasnya',
  'super canggih',
  'tanpa cela',
  'mengubah segalanya',
  'dijamin akurat',
  '100% akurat',
  'solusi terbaik',
  'kekuatan ai',
  'cerdas secara ajaib',
  'masa depan deteksi',
  'hanya sekali klik',
  'tanpa batas',
  'revolutionary',
  'best in class',
  'cutting edge',
  'seamless',
  'game changer',
  'guaranteed accurate',
  '100% accurate',
  'ultimate solution',
  'ai magic',
  'magically intelligent',
  'future of detection',
  'one click away',
  'limitless',
  'delve',
  'robust',
  'leverage',
]

const EMOJI_PATTERN = /[\p{Extended_Pictographic}]/u

function isScannable(filePath) {
  return EXTENSIONS.has(extname(filePath).toLowerCase())
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue
      files.push(...(await collectFiles(join(directory, entry.name))))
      continue
    }
    const filePath = join(directory, entry.name)
    if (isScannable(filePath)) files.push(filePath)
  }
  return files
}

function findIssues(content) {
  const issues = []
  const lines = content.split(/\r?\n/)

  lines.forEach((line, index) => {
    const lineNumber = index + 1

    for (const [label, character] of [
      ['em dash', '\u2014'],
      ['en dash', '\u2013'],
    ]) {
      let position = line.indexOf(character)
      while (position !== -1) {
        issues.push({
          line: lineNumber,
          column: position + 1,
          message: `${label} U+${character.codePointAt(0).toString(16).toUpperCase()} dilarang`,
        })
        position = line.indexOf(character, position + 1)
      }
    }

    const emojiMatch = EMOJI_PATTERN.exec(line)
    if (emojiMatch) {
      issues.push({
        line: lineNumber,
        column: emojiMatch.index + 1,
        message: 'emoji dilarang di UI dan dokumentasi produk',
      })
    }

    const lower = line.toLowerCase()
    for (const phrase of BANNED_PHRASES) {
      const position = lower.indexOf(phrase)
      if (position !== -1) {
        issues.push({
          line: lineNumber,
          column: position + 1,
          message: `frasa terlarang: "${phrase}"`,
        })
      }
    }
  })

  return issues
}

async function main() {
  const files = []

  for (const directory of TARGET_DIRECTORIES) {
    files.push(...(await collectFiles(join(ROOT, directory))))
  }

  for (const fileName of TARGET_FILES) {
    files.push(join(ROOT, fileName))
  }

  let totalIssues = 0
  let scanned = 0

  for (const file of files) {
    const content = await readFile(file, 'utf8')
    const issues = findIssues(content)
    scanned += 1
    if (issues.length === 0) continue
    totalIssues += issues.length
    const displayPath = relative(ROOT, file).replaceAll('\\', '/')
    for (const issue of issues) {
      console.error(
        `${displayPath}:${issue.line}:${issue.column} ${issue.message}`,
      )
    }
  }

  if (totalIssues > 0) {
    console.error(`\nCopy check gagal: ${totalIssues} masalah pada ${scanned} file.`)
    process.exit(1)
  }

  console.log(`Copy check lolos: ${scanned} file diperiksa.`)
}

main().catch((error) => {
  console.error('Copy check error:', error)
  process.exit(1)
})
