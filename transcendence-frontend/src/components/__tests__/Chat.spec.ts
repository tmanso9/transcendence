import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import Chat from '../Chat.vue'

describe('Chat', () => {
  it('renders properly', () => {
    const wrapper = mount(Chat)
    expect(wrapper.exists())
  })
})
