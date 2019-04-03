import {
  bulkInputToNameRegex,
  isBulkInputCommander,
  purposesFromBulkInput,
  scryfallIdForInput,
} from '../../../server/api/deck-validation'

describe('Deck Validation', () => {
  describe('bulkInputToNameRegex', () => {
    test('pulls name from line with no tags', () => {
      const input = 'lightning bolt'

      const result = bulkInputToNameRegex(input)

      expect(result.test('Lightning Bolt')).toBe(true)
    })

    test('pulls name from line with no tags and whitespace', () => {
      const input = ' lightning bolt  '

      const result = bulkInputToNameRegex(input)

      expect(result.test('Lightning Bolt')).toBe(true)
    })

    test('pulls name from line with tags', () => {
      const input = 'lightning bolt # burn baby burn'

      const result = bulkInputToNameRegex(input)

      expect(result.test('Lightning Bolt')).toBe(true)
    })

    test('pulls name from line with tags and whitespace', () => {
      const input = '   lightning bolt# burn baby burn'

      const result = bulkInputToNameRegex(input)

      expect(result.test('Lightning Bolt')).toBe(true)
    })

    test('pulls name from commander', () => {
      const input = 'rafiq of the many *CMDR*'

      const result = bulkInputToNameRegex(input)

      expect(result.test('Rafiq of the Many')).toBe(true)
    })

    test('pulls name from commander with tags', () => {
      const input = 'rafiq of the many *CMDR* # double strike'

      const result = bulkInputToNameRegex(input)

      expect(result.test('Rafiq of the Many')).toBe(true)
    })

    test('pulls name from commander with sigil in front', () => {
      const input = '*cmdr* rafiq of the many # double strike'

      const result = bulkInputToNameRegex(input)

      expect(result.test('Rafiq of the Many')).toBe(true)
    })
  })

  describe('isBulkInputCommander', () => {
    test('has commander sigil', () => {
      const input = 'rafiq of the many *CMDR*'

      expect(isBulkInputCommander(input)).toBe(true)
    })

    test('has commander sigil in front', () => {
      const input = '*cmdr* rafiq of the many'

      expect(isBulkInputCommander(input)).toBe(true)
    })

    test('has commander sigil with tags', () => {
      const input = 'rafiq of the many *CMDR* # double strike, looking left'

      expect(isBulkInputCommander(input)).toBe(true)
    })

    test('does not have commander sigil', () => {
      const input = 'rafiq of the many # double strike, looking left'

      expect(isBulkInputCommander(input)).toBe(false)
    })
  })

  describe('purposesFromBulkInput', () => {
    test('has no purposes', () => {
      const input = 'Rafiq of the Many'

      expect(purposesFromBulkInput(input)).toEqual([])
    })

    test('one purpose', () => {
      const input = 'Rafiq of the Many # double strike'

      expect(purposesFromBulkInput(input)).toEqual(['double strike'])
    })

    test('several purposes', () => {
      const input = 'Rafiq of the Many # double strike, looking left, kitty cat'

      expect(purposesFromBulkInput(input)).toEqual([
        'double strike',
        'looking left',
        'kitty cat',
      ])
    })

    test('dedupes', () => {
      const input =
        'Rafiq of the Many # double strike, looking left, kitty cat, double strike'

      expect(purposesFromBulkInput(input)).toEqual([
        'double strike',
        'looking left',
        'kitty cat',
      ])
    })

    test('with commander sigil', () => {
      const input =
        'Rafiq of the Many *CMDR* # double strike, looking left, kitty cat'

      expect(purposesFromBulkInput(input)).toEqual([
        'double strike',
        'looking left',
        'kitty cat',
      ])
    })
  })

  describe('scryfallIdForInput', () => {
    test('finds proper scryfallId', () => {
      const sources = [
        { scryfallId: 1, name: 'Lightning Bolt' },
        { scryfallId: 2, name: 'Rafiq of the Many' },
        { scryfallId: 3, name: 'Counterspell' },
      ]

      const result = scryfallIdForInput('Rafiq of the Many # ...', sources)

      expect(result).toBe(2)
    })
  })
})
