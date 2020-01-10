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
        const the99 = []
        const state = { usePurposeGroups: true }

        const result = getters.cardGroupings(state, { the99 })

        expect(result).toEqual([])
      })

      test('groups all cards by purpose', () => {
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
        const state = { usePurposeGroups: true }

        const result = getters.cardGroupings(state, { the99 })

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
        const state = { usePurposeGroups: true }

        const result = getters.cardGroupings(state, { the99 })

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
        const state = { usePurposeGroups: false }

        const result = getters.cardGroupings(state, { the99 })

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
    })
  })
})
