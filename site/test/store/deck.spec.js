import { getters } from '~/store/deck'

describe('Deck Store', () => {
  describe('getters', () => {
    describe('suggestedPurposes', () => {
      test('combines commander purposes with starting set of purposes', () => {
        const commanders = [
          {
            purposes: ['Ramp', 'Card draw'],
          },
          {
            purposes: ['Sac outlet', 'Board wipe'],
          },
        ]
        const state = {}

        const result = getters.suggestedPurposes(state, { commanders })

        expect(result).toEqual([
          'Ramp',
          'Card draw',
          'Sac outlet',
          'Board wipe',
          'Mana rock',
          'Targeted removal',
          'Utility',
        ])
      })
    })

    describe('colorIdentity', () => {
      test('combines ci of each commander in wubrg order', () => {
        const commanders = [
          {
            source: {
              ci: ['G'],
            },
          },
          {
            source: {
              ci: ['W', 'B'],
            },
          },
        ]
        const state = {}

        const result = getters.colorIdentity(state, { commanders })

        expect(result).toEqual(['W', 'B', 'G'])
      })

      test('is empty for colorless commander', () => {
        const commanders = [
          {
            source: {
              ci: [],
            },
          },
        ]
        const state = {}

        const result = getters.colorIdentity(state, { commanders })

        expect(result).toEqual([])
      })
    })

    describe('cardGroupings', () => {
      test('is empty array for no cards', () => {
        const commanders = []
        const the99 = []
        const compuPurposeHash = {}
        const state = { usePurposeGroups: true }

        const result = getters.cardGroupings(state, {
          commanders,
          the99,
          compuPurposeHash,
        })

        expect(result).toEqual([])
      })

      test('groups all cards by purpose', () => {
        const commanders = []
        const the99 = [
          {
            source: { name: 'Lightning Bolt' },
            purposes: ['Burn', 'Targeted Removal'],
          },
          {
            source: { name: 'Mountain' },
            purposes: ['Land'],
          },
          {
            source: { name: 'Mountain' },
            purposes: ['Land'],
          },
          {
            source: { name: 'Mountain' },
            purposes: ['Land'],
          },
          {
            source: { name: 'Mountain' },
            purposes: ['Land'],
          },
          {
            source: { name: 'Mountain' },
            purposes: ['Land'],
          },
          {
            source: { name: 'Earthquake' },
            purposes: ['Burn', 'Board Wipe'],
          },
          {
            source: { name: 'Sol Ring' },
            purposes: ['Ramp'],
          },
        ]
        const compuPurposeHash = {}
        const state = { usePurposeGroups: true }

        const result = getters.cardGroupings(state, {
          commanders,
          the99,
          compuPurposeHash,
        })

        expect(result).toEqual([
          {
            purpose: 'Land',
            cards: [
              { source: { name: 'Mountain' }, purposes: ['Land'], count: 5 },
            ],
          },
          {
            purpose: 'Burn',
            cards: [
              {
                source: { name: 'Earthquake' },
                purposes: ['Burn', 'Board Wipe'],
                count: 1,
              },
              {
                source: { name: 'Lightning Bolt' },
                purposes: ['Burn', 'Targeted Removal'],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Board Wipe',
            cards: [
              {
                source: { name: 'Earthquake' },
                purposes: ['Burn', 'Board Wipe'],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Ramp',
            cards: [
              { source: { name: 'Sol Ring' }, purposes: ['Ramp'], count: 1 },
            ],
          },
          {
            purpose: 'Targeted Removal',
            cards: [
              {
                source: { name: 'Lightning Bolt' },
                purposes: ['Burn', 'Targeted Removal'],
                count: 1,
              },
            ],
          },
        ])
      })

      test('groups cards by dominant type if no purposes', () => {
        const commanders = []
        const the99 = [
          {
            source: { name: 'Lightning Bolt', faces: [{ types: ['Instant'] }] },
            purposes: [],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: ['Favorite Art'],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: [],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: [],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: [],
          },
          {
            source: {
              name: 'Dryad Arbor',
              faces: [{ types: ['Land', 'Creature'] }],
            },
            purposes: [],
          },
          {
            source: { name: 'Earthquake', faces: [{ types: ['Sorcery'] }] },
            purposes: [],
          },
          {
            source: { name: 'Sol Ring', faces: [{ types: ['Artifact'] }] },
            purposes: [],
          },
        ]
        const compuPurposeHash = {}
        const state = { usePurposeGroups: true }

        const result = getters.cardGroupings(state, {
          commanders,
          the99,
          compuPurposeHash,
        })

        expect(result).toEqual([
          {
            purpose: 'Land',
            isAutomaticGroup: true,
            cards: [
              {
                source: {
                  name: 'Dryad Arbor',
                  faces: [{ types: ['Land', 'Creature'] }],
                },
                purposes: [],
                count: 1,
              },
              {
                source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
                purposes: [],
                count: 3,
              },
            ],
          },
          {
            purpose: 'Artifact',
            isAutomaticGroup: true,
            cards: [
              {
                source: { name: 'Sol Ring', faces: [{ types: ['Artifact'] }] },
                purposes: [],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Favorite Art',
            cards: [
              {
                source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
                purposes: ['Favorite Art'],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Instant',
            isAutomaticGroup: true,
            cards: [
              {
                source: {
                  name: 'Lightning Bolt',
                  faces: [{ types: ['Instant'] }],
                },
                purposes: [],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Sorcery',
            isAutomaticGroup: true,
            cards: [
              {
                source: { name: 'Earthquake', faces: [{ types: ['Sorcery'] }] },
                purposes: [],
                count: 1,
              },
            ],
          },
        ])
      })

      test('groups all cards by type', () => {
        const commanders = []
        const the99 = [
          {
            source: { name: 'Lightning Bolt', faces: [{ types: ['Instant'] }] },
            purposes: [],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: ['Favorite Art'],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: [],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: [],
          },
          {
            source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
            purposes: [],
          },
          {
            source: {
              name: 'Dryad Arbor',
              faces: [{ types: ['Land', 'Creature'] }],
            },
            purposes: [],
          },
          {
            source: { name: 'Earthquake', faces: [{ types: ['Sorcery'] }] },
            purposes: [],
          },
          {
            source: { name: 'Sol Ring', faces: [{ types: ['Artifact'] }] },
            purposes: [],
          },
        ]
        const compuPurposeHash = {}
        const state = { usePurposeGroups: false }

        const result = getters.cardGroupings(state, {
          commanders,
          the99,
          compuPurposeHash,
        })

        expect(result).toEqual([
          {
            purpose: 'Land',
            isAutomaticGroup: true,
            cards: [
              {
                source: {
                  name: 'Dryad Arbor',
                  faces: [{ types: ['Land', 'Creature'] }],
                },
                purposes: [],
                count: 1,
              },
              {
                source: { name: 'Mountain', faces: [{ types: ['Land'] }] },
                purposes: ['Favorite Art'],
                count: 4,
              },
            ],
          },
          {
            purpose: 'Artifact',
            isAutomaticGroup: true,
            cards: [
              {
                source: { name: 'Sol Ring', faces: [{ types: ['Artifact'] }] },
                purposes: [],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Instant',
            isAutomaticGroup: true,
            cards: [
              {
                source: {
                  name: 'Lightning Bolt',
                  faces: [{ types: ['Instant'] }],
                },
                purposes: [],
                count: 1,
              },
            ],
          },
          {
            purpose: 'Sorcery',
            isAutomaticGroup: true,
            cards: [
              {
                source: { name: 'Earthquake', faces: [{ types: ['Sorcery'] }] },
                purposes: [],
                count: 1,
              },
            ],
          },
        ])
      })

      test('includes commanders', () => {
        const commanders = [
          {
            source: { name: 'Krenko, Mob Boss' },
            purposes: ['Token Generation'],
          },
        ]
        const the99 = []
        const compuPurposeHash = {}
        const state = { usePurposeGroups: true }

        const result = getters.cardGroupings(state, {
          commanders,
          the99,
          compuPurposeHash,
        })

        expect(result).toEqual([
          {
            purpose: 'Token Generation',
            cards: [
              {
                source: { name: 'Krenko, Mob Boss' },
                purposes: ['Token Generation'],
                count: 1,
              },
            ],
          },
        ])
      })
    })

    describe('compuPurposeHash', () => {
      test('type', () => {
        const commanders = [
          { source: { faces: [{ types: ['Artifact', 'Creature'] }] } },
        ]
        const the99 = [
          { source: { faces: [{ types: ['Artifact', 'Creature'] }] } },
          { source: { faces: [{ types: ['Artifact'] }] } },
          { source: { faces: [{ types: ['Instant'] }] } },
        ]

        const compuPurposes = [
          {
            title: 'artifacts',
            rules: [
              {
                field: 'type',
                is: true,
                conditions: [{ value: 'Artifact' }],
              },
            ],
          },
        ]

        const result = getters.compuPurposeHash(
          {},
          { commanders, the99, compuPurposes }
        )

        expect(Object.keys(result)).toEqual(['artifacts'])
        expect(result.artifacts).toHaveLength(3)
      })

      test('not type', () => {
        const commanders = [
          { source: { faces: [{ types: ['Artifact', 'Creature'] }] } },
        ]
        const the99 = [
          { source: { faces: [{ types: ['Artifact', 'Creature'] }] } },
          { source: { faces: [{ types: ['Artifact'] }] } },
          { source: { faces: [{ types: ['Instant'] }] } },
        ]

        const compuPurposes = [
          {
            title: 'not artifacts',
            rules: [
              {
                field: 'type',
                is: false,
                conditions: [{ value: 'Artifact' }],
              },
            ],
          },
        ]

        const result = getters.compuPurposeHash(
          {},
          { commanders, the99, compuPurposes }
        )

        expect(Object.keys(result)).toEqual(['not artifacts'])
        expect(result['not artifacts']).toHaveLength(1)
        expect(result['not artifacts'][0].source.faces[0].types[0]).toBe(
          'Instant'
        )
      })

      test('cmc', () => {
        const commanders = []
        const the99 = [
          { source: { cmc: 1, faces: [] } },
          { source: { cmc: 2, faces: [] } },
          { source: { cmc: 3, faces: [] } },
        ]

        const compuPurposes = [
          {
            title: 'ones',
            rules: [
              {
                field: 'cmc',
                is: true,
                conditions: [{ value: 1 }],
              },
            ],
          },
        ]

        const result = getters.compuPurposeHash(
          {},
          { commanders, the99, compuPurposes }
        )

        expect(Object.keys(result)).toEqual(['ones'])
        expect(result.ones).toHaveLength(1)
        expect(result.ones[0].source.cmc).toBe(1)
      })

      test('not cmc', () => {
        const commanders = []
        const the99 = [
          { source: { cmc: 1, faces: [] } },
          { source: { cmc: 2, faces: [] } },
          { source: { cmc: 3, faces: [] } },
        ]

        const compuPurposes = [
          {
            title: 'notones',
            rules: [
              {
                field: 'cmc',
                is: false,
                conditions: [{ value: 1 }],
              },
            ],
          },
        ]

        const result = getters.compuPurposeHash(
          {},
          { commanders, the99, compuPurposes }
        )

        expect(Object.keys(result)).toEqual(['notones'])
        expect(result.notones).toHaveLength(2)
        expect(result.notones[0].source.cmc).toBe(2)
        expect(result.notones[1].source.cmc).toBe(3)
      })
    })

    describe('numCards', () => {
      test('sums num commanders and 99', () => {
        const commanders = [{}, {}]
        const the99 = [{}, {}, {}]

        expect(getters.numCards({}, { commanders, the99 })).toBe(5)
      })
    })

    describe('cmcArrayMinusLands', () => {
      test('ignores lands', () => {
        const commanders = [
          {
            source: { cmc: 1, faces: [{ types: ['Creature'] }] },
          },
        ]
        const the99 = [
          {
            source: { cmc: 0, faces: [{ types: ['Land'] }] },
          },
          {
            source: { cmc: 0, faces: [{ types: ['Land'] }] },
          },
          {
            source: { cmc: 2, faces: [{ types: ['Artifact'] }] },
          },
          {
            source: { cmc: 3, faces: [{ types: ['Enchantment'] }] },
          },
          {
            source: { cmc: 4, faces: [{ types: ['Sorcery'] }] },
          },
        ]

        expect(getters.cmcArrayMinusLands({}, { commanders, the99 })).toEqual([
          1,
          2,
          3,
          4,
        ])
      })
    })

    describe('averageCmc', () => {
      test('averages the cmc array', () => {
        const cmcArrayMinusLands = [1, 3, 3, 5]

        expect(getters.averageCmc({}, { cmcArrayMinusLands })).toBe(3)
      })

      test('gives average to two decimals', () => {
        const cmcArrayMinusLands = [1, 2, 2]

        expect(getters.averageCmc({}, { cmcArrayMinusLands })).toBe(1.67)
      })

      test('is zero if no cards', () => {
        const cmcArrayMinusLands = []

        expect(getters.averageCmc({}, { cmcArrayMinusLands })).toBe(0)
      })
    })

    describe('medianCmc', () => {
      test('gives middle number if odd length', () => {
        const cmcArrayMinusLands = [1, 2, 3, 17, 18]

        expect(getters.medianCmc({}, { cmcArrayMinusLands })).toBe(3)
      })

      test('gives middle avg if even length', () => {
        const cmcArrayMinusLands = [1, 2, 3, 4]

        expect(getters.medianCmc({}, { cmcArrayMinusLands })).toBe(2.5)
      })

      test('is zero if no cards', () => {
        const cmcArrayMinusLands = []

        expect(getters.medianCmc({}, { cmcArrayMinusLands })).toBe(0)
      })
    })

    describe('castingCostPipCounts', () => {
      test('sums up all costing cast pips', () => {
        const commanders = [
          {
            source: {
              faces: [
                {
                  manaCost: '{W}{U}{B}{R}{G}',
                },
              ],
            },
          },
        ]
        const the99 = [
          {
            source: {
              faces: [
                {
                  manaCost: '{1}{W}',
                },
              ],
            },
          },
          {
            source: {
              faces: [
                {
                  manaCost: '{2}{U}',
                },
              ],
            },
          },
          {
            source: {
              faces: [
                {
                  manaCost: '{2}{C}',
                },
              ],
            },
          },
          {
            source: {
              faces: [
                {
                  manaCost: '{X}{B}{R}{G}',
                },
              ],
            },
          },
        ]

        const result = getters.castingCostPipCounts({}, { commanders, the99 })

        expect(result).toEqual({
          W: { count: 2, ratio: 2 / 11 },
          U: { count: 2, ratio: 2 / 11 },
          B: { count: 2, ratio: 2 / 11 },
          R: { count: 2, ratio: 2 / 11 },
          G: { count: 2, ratio: 2 / 11 },
          C: { count: 1, ratio: 1 / 11 },
        })
      })

      test('prunes zeroes', () => {
        const commanders = [
          {
            source: {
              faces: [
                {
                  manaCost: '{W}{U}',
                },
              ],
            },
          },
        ]
        const the99 = [
          {
            source: {
              faces: [
                {
                  manaCost: '{1}{W}',
                },
              ],
            },
          },
          {
            source: {
              faces: [
                {
                  manaCost: '{2}{U}',
                },
              ],
            },
          },
          {
            source: {
              faces: [
                {
                  manaCost: '{2}{C}',
                },
              ],
            },
          },
        ]

        const result = getters.castingCostPipCounts({}, { commanders, the99 })

        expect(result).toEqual({
          W: { count: 2, ratio: 2 / 5 },
          U: { count: 2, ratio: 2 / 5 },
          C: { count: 1, ratio: 1 / 5 },
        })
      })
    })
  })
})
