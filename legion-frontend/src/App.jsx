import { useState } from 'react'
import reactLogo from './assets/legion.png'
import viteLogo from '/legion.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
    </>
  )
}

export default App
