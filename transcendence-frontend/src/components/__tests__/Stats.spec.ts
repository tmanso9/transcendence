import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Stats from '../Stats.vue'

describe('Stats', () => {
  it('renders properly', () => {
    const wrapper = mount(Stats)
    expect(wrapper.exists())
  })
})
