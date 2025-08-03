import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function saveFile(file: File, directory: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  const filename = file.name.replace(/\.[^/.]+$/, '') + '-' + uniqueSuffix + path.extname(file.name)
  const dirPath = path.join(process.cwd(), 'public', directory)
  const filepath = path.join(dirPath, filename)

  // Create directory if it doesn't exist
  await mkdir(dirPath, { recursive: true })

  await writeFile(filepath, buffer)
  return `/${directory}/${filename}`
}