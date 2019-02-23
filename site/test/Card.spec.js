import { mount } from '@vue/test-utils'
import Card from '@/components/Card.vue'

describe('Card', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Card, {
      propsData: {
        card: {
          imageUris: {
            small: 'sm.jpg',
            large: 'lg.jpg',
          },
        },
        size: 'medium',
      },
    })
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
