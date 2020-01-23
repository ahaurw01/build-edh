import {
  bulkInputToNameRegex,
  isBulkInputCommander,
  isBulkInputFoil,
  setCodeFromBulkInput,
  purposesFromBulkInput,
  sourceForInput,
  validateBulkInput,
  validateCommanders,
  validateThe99,
  parseBulkInputNumbers,
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

    test('knows about foil tag', () => {
      const input = 'rafiq of the many *F*  # double strike'

      const result = bulkInputToNameRegex(input)

      expect(result.test('Rafiq of the Many')).toBe(true)
    })

    test('knows about set code', () => {
      const input = 'rafiq of the many (xyz)  # double strike'

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

  describe('isBulkInputFoil', () => {
    test('no if no foil tag', () => {
      const input = 'foil'

      expect(isBulkInputFoil(input)).toBe(false)
    })

    test('yes if starting foil tag', () => {
      const input = '*f* foil'

      expect(isBulkInputFoil(input)).toBe(true)
    })

    test('yes if ending foil tag', () => {
      const input = 'foil *F*'

      expect(isBulkInputFoil(input)).toBe(true)
    })
  })

  describe('setCodeFromBulkInput', () => {
    test('nothing if no set code', () => {
      const input = 'foil'

      expect(setCodeFromBulkInput(input)).toBeFalsy()
    })

    test('finds starting set code', () => {
      const input = '(hi) foil'

      expect(setCodeFromBulkInput(input)).toBe('hi')
    })

    test('finds ending set code', () => {
      const input = 'foil (hi)'

      expect(setCodeFromBulkInput(input)).toBe('hi')
    })
  })

  describe('parseBulkInputNumbers', () => {
    test('does not impact input without numbers', done => {
      const ctx = {
        request: {
          body: {
            updates: ['Lightning Bolt', '*CMDR* Krenko', 'Mountain # basic'],
          },
        },
      }

      parseBulkInputNumbers(ctx, () => {
        expect(ctx.request.body.updates).toEqual([
          'Lightning Bolt',
          '*CMDR* Krenko',
          'Mountain # basic',
        ])
        done()
      })
    })

    test('replaces numbers with row instances', done => {
      const ctx = {
        request: {
          body: {
            updates: [
              'Lightning Bolt',
              '*CMDR* Krenko',
              '3 Mountain # basic',
              '2x Snow-Covered Mountain',
              '1 Wastes',
            ],
          },
        },
      }

      parseBulkInputNumbers(ctx, () => {
        expect(ctx.request.body.updates).toEqual([
          'Lightning Bolt',
          '*CMDR* Krenko',
          'Mountain # basic',
          'Mountain # basic',
          'Mountain # basic',
          'Snow-Covered Mountain',
          'Snow-Covered Mountain',
          'Wastes',
        ])
        done()
      })
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

  describe('sourceForInput', () => {
    test('finds proper source', () => {
      const sources = [
        { scryfallId: 1, name: 'Lightning Bolt' },
        { scryfallId: 2, name: 'Rafiq of the Many' },
        { scryfallId: 3, name: 'Counterspell' },
      ]

      const result = sourceForInput('Rafiq of the Many # ...', sources)

      expect(result.scryfallId).toBe(2)
    })
  })

  describe('validateBulkInput', () => {
    test('sets missingCardInputs for missing cards', done => {
      const ctx = {
        state: {
          bulkInputSources: [
            {
              name: 'Lightning Bolt',
            },
            {
              name: 'Giant Growth',
            },
          ],
        },
        request: {
          body: {
            updates: [
              'Lightning Bolt # pew pew',
              'Swords to Plowshares # go away',
              'Giant Growth # get biggg',
            ],
          },
        },
      }

      validateBulkInput(ctx, () => {
        expect(ctx.state.missingCardInputs).toEqual([
          'Swords to Plowshares # go away',
        ])
        done()
      })
    })

    test('is cool for existing cards', done => {
      const ctx = {
        state: {
          bulkInputSources: [
            {
              name: 'Lightning Bolt',
            },
            {
              name: 'Giant Growth',
            },
          ],
        },
        request: {
          body: {
            updates: ['Lightning Bolt # pew pew', 'Giant Growth # get biggg'],
          },
        },
      }

      validateBulkInput(ctx, () => {
        expect(ctx.state.missingCardInputs).toEqual([])
        done()
      })
    })
  })

  describe('validateCommanders', () => {
    test('is cool with valid commander', done => {
      const ctx = {
        state: {
          deck: {
            commanders: [{ scryfallId: 1 }],
          },
          commanderSources: [
            {
              scryfallId: 1,
              name: 'Rafiq of the Many',
              canBeCommander: true,
            },
          ],
        },
      }

      validateCommanders(ctx, () => {
        expect(ctx.state.commanderErrorMessages).toEqual([])
        done()
      })
    })

    test('is cool with valid partners', done => {
      const ctx = {
        state: {
          deck: {
            commanders: [{ scryfallId: 1 }, { scryfallId: 2 }],
          },
          commanderSources: [
            {
              scryfallId: 1,
              name: 'Tymna the Weaver',
              canBeCommander: true,
              isPartner: true,
            },
            {
              scryfallId: 2,
              name: 'Thrasios, Triton Hero',
              canBeCommander: true,
              isPartner: true,
            },
          ],
        },
      }

      validateCommanders(ctx, () => {
        expect(ctx.state.commanderErrorMessages).toEqual([])
        done()
      })
    })

    test('is cool with valid partnerWiths', done => {
      const ctx = {
        state: {
          deck: {
            commanders: [{ scryfallId: 1 }, { scryfallId: 2 }],
          },
          commanderSources: [
            {
              scryfallId: 1,
              name: 'Toothy, Imaginary Friend',
              canBeCommander: true,
              isPartner: true,
              partnerWith: 'Pir, Imaginative Rascal',
            },
            {
              scryfallId: 2,
              name: 'Pir, Imaginative Rascal',
              canBeCommander: true,
              isPartner: true,
              partnerWith: 'Toothy, Imaginary Friend',
            },
          ],
        },
      }

      validateCommanders(ctx, () => {
        expect(ctx.state.commanderErrorMessages).toEqual([])
        done()
      })
    })

    test('points out relevant problems with > 2 commanders', done => {
      const ctx = {
        state: {
          deck: {
            commanders: [
              { scryfallId: 1 },
              { scryfallId: 2 },
              { scryfallId: 2.5 },
              { scryfallId: 3 },
            ],
          },
          commanderSources: [
            {
              scryfallId: 1,
              name: 'Toothy, Imaginary Friend',
              canBeCommander: true,
              isPartner: true,
              partnerWith: 'Pir, Imaginative Rascal',
            },
            {
              scryfallId: 2,
              name: 'Rafiq of the Many',
              canBeCommander: true,
              isPartner: false,
            },
            {
              scryfallId: 2.5,
              name: 'Rafiq of the Many',
              canBeCommander: true,
              isPartner: false,
            },
            {
              scryfallId: 3,
              name: 'Lightning Bolt',
              canBeCommander: false,
            },
          ],
        },
      }

      validateCommanders(ctx, () => {
        expect(ctx.state.commanderErrorMessages).toEqual([
          'Cannot have more than two commanders',
          'Ineligible commander',
        ])
        done()
      })
    })

    test('points out relevant problems with 2 commanders', done => {
      const ctx = {
        state: {
          deck: {
            commanders: [{ scryfallId: 1 }, { scryfallId: 2 }],
          },
          commanderSources: [
            {
              scryfallId: 1,
              name: 'Toothy, Imaginary Friend',
              canBeCommander: true,
              isPartner: true,
              partnerWith: 'Pir, Imaginative Rascal',
            },
            {
              scryfallId: 2,
              name: 'Rafiq of the Many',
              canBeCommander: true,
              isPartner: false,
            },
          ],
        },
      }

      validateCommanders(ctx, () => {
        expect(ctx.state.commanderErrorMessages).toEqual([
          'Both commanders must have partner',
          'Mismatch of specified partner',
        ])
        done()
      })
    })
  })

  describe('validateThe99', () => {
    test('complains for illegal duplicates', done => {
      const ctx = {
        state: {
          deck: {
            commanders: [{ scryfallId: 1 }],
            the99: '_'
              .repeat(99)
              .split('')
              .map((char, index) => ({
                scryfallId: index < 95 ? 2 : index < 97 ? 3 : 4,
              })),
          },
          commanderSources: [
            {
              scryfallId: 1,
              name: 'Tymna the Weaver',
              canBeCommander: true,
              isPartner: true,
            },
          ],
          the99Sources: [
            {
              scryfallId: 2,
              name: 'Plains',
              canHaveMultiple: true,
            },
            {
              scryfallId: 3,
              name: 'Swords to Plowshares',
              canHaveMultiple: false,
            },
            {
              scryfallId: 4,
              name: 'Vampiric Tutor',
              canHaveMultiple: false,
            },
          ],
        },
      }

      validateThe99(ctx, () => {
        expect(ctx.state.the99ErrorMessages).toEqual([
          'Illegal duplicates: Swords to Plowshares, Vampiric Tutor',
        ])
        done()
      })
    })
  })
})
