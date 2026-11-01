import './App.css'
import Header from './components/Header'
import UserInput from './components/UserInput'
function App() {

  return (
    <div className="App bg-background flex flex-col items-center justify-center min-h-screen">
      <Header />
      <UserInput />
    </div>
  )
}

export default App
