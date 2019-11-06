import React, { useState, CSSProperties } from 'react'
import { TextClamp } from '../src'
const App = function() {
  const [range, setRange] = useState(50)
  const [line, setLine] = useState(2)
  const style: CSSProperties = {
    width: `${range}vw`
  }
  const text = `bla bla bla bla bla blabla bla blabla bla blabla bla blabla bla blabla
  bla blabla bla bla bla bla blabla bla blabla bla blabla bla blabla bla
  blabla bla blabla bla blabla bla bla la blabla bla blabla bla blala blabla bla blabla bla blala blabla bla blabla bla bla`
  return (
    <div style={{ lineHeight: '16px' }}>
      <div>
        width:
        <input
          type='range'
          value={range}
          onChange={e => setRange(+e.target.value)}
        />{' '}
        {range}vw
      </div>
      <div>
        maxLine:
        <input
          type='number'
          value={line}
          onChange={e => setLine(+e.target.value)}
        />
      </div>
      <TextClamp className='demo' maxLine={line} style={style}>
        {text}
      </TextClamp>
      <TextClamp className='demo' maxLine={line} showExpand style={style}>
        {text}
      </TextClamp>
      <TextClamp
        className='demo'
        maxLine={line}
        lineHeight={20}
        showExpand
        style={style}
        renderTrigger={({ expanded }) => <button>toggle</button>}>
        {text}
      </TextClamp>
    </div>
  )
}

export default App
