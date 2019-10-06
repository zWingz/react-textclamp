import React from 'react'
import { hot } from 'react-hot-loader'
import { TextClamp } from '../src'
declare const module: any
const App = hot(module)(() => {
  return <TextClamp maxLine={2} showExpand>
    bla bla bla bla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla bla

    bla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla blabla bla bla
  </TextClamp>
})

export default App
