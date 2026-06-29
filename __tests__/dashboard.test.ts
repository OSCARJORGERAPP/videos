/**
 * Tests de lógica del dashboard (RF-12): agregación y formateo de datos.
 */

describe('dashboard — formatBytes', () => {
  function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  test('devuelve 0.0 KB cuando bytes es 0', () => {
    expect(formatBytes(0)).toBe('0.0 KB')
  })

  test('devuelve MB para valores medios', () => {
    expect(formatBytes(50 * 1024 * 1024)).toBe('50.0 MB')
  })

  test('devuelve GB para valores grandes', () => {
    expect(formatBytes(1.5 * 1024 * 1024 * 1024)).toBe('1.50 GB')
  })
})

describe('dashboard — datos por defecto cuando no hay vídeos', () => {
  function processAgg(agg: { count: number; totalBytes: number } | null) {
    return {
      count: agg?.count ?? 0,
      totalBytes: agg?.totalBytes ?? 0,
    }
  }

  test('sin vídeos → count 0, totalBytes 0', () => {
    expect(processAgg(null)).toEqual({ count: 0, totalBytes: 0 })
  })

  test('con vídeos → propaga valores', () => {
    expect(processAgg({ count: 5, totalBytes: 1024 })).toEqual({ count: 5, totalBytes: 1024 })
  })
})
