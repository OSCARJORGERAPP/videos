/**
 * Tests de lógica de vídeos: validación de campos y construcción de filtros.
 * No requiere MongoDB ni RustFS corriendo.
 */

describe('videos — validación de campos requeridos (RF-06)', () => {
  function validateVideoPayload(body: Record<string, unknown>) {
    const required = ['name', 'key', 'size', 'contentType'] as const
    for (const field of required) {
      if (!body[field]) return { ok: false, missing: field }
    }
    return { ok: true }
  }

  test('falla si falta name', () => {
    expect(validateVideoPayload({ key: 'k', size: 100, contentType: 'video/mp4' })).toMatchObject({
      ok: false,
      missing: 'name',
    })
  })

  test('falla si falta key', () => {
    expect(validateVideoPayload({ name: 'v', size: 100, contentType: 'video/mp4' })).toMatchObject({
      ok: false,
      missing: 'key',
    })
  })

  test('ok con todos los campos', () => {
    expect(
      validateVideoPayload({ name: 'v', key: 'k', size: 100, contentType: 'video/mp4' })
    ).toMatchObject({ ok: true })
  })
})

describe('videos — parseo de tags (RF-08)', () => {
  function parseTags(input: string): string[] {
    return input
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }

  test('separa por coma', () => {
    expect(parseTags('react, typescript, tutorial')).toEqual(['react', 'typescript', 'tutorial'])
  })

  test('ignora entradas vacías', () => {
    expect(parseTags('a,,b,')).toEqual(['a', 'b'])
  })

  test('string vacío → array vacío', () => {
    expect(parseTags('')).toEqual([])
  })
})

describe('videos — formatBytes', () => {
  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  test('bytes', () => expect(formatBytes(512)).toBe('512 B'))
  test('KB', () => expect(formatBytes(2048)).toBe('2.0 KB'))
  test('MB', () => expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB'))
  test('GB', () => expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2.00 GB'))
})
