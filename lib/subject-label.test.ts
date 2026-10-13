import { describe, expect, it } from 'vitest'
import { subjectLabel } from './subject-label'

describe('subjectLabel', () => {
  it('adds the เอก prefix to a bare subject', () => {
    expect(subjectLabel('คณิตศาสตร์')).toBe('เอกคณิตศาสตร์')
  })

  it('does not double the prefix', () => {
    expect(subjectLabel('เอกคณิตศาสตร์')).toBe('เอกคณิตศาสตร์')
    expect(subjectLabel('เอก คณิตศาสตร์')).toBe('เอกคณิตศาสตร์')
  })

  it('handles several comma-separated subjects', () => {
    expect(subjectLabel('เอกคณิตศาสตร์, ฟิสิกส์')).toBe('เอกคณิตศาสตร์, เอกฟิสิกส์')
  })
})
