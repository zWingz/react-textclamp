import * as React from 'react'
import { shallow } from 'enzyme'
import { TextClamp } from '..'
describe('test ', () => {
  it('test ', () => {
    const wrapper = shallow(<TextClamp/>)
    expect(wrapper.find('div').text()).toBe('hello world')
  })
})
