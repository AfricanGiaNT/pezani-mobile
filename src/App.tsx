import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route 
          path="/" 
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold text-primary mb-4">Pezani Estates</h1>
              <p className="text-text-light mb-4">Coming Soon</p>
              <div className="bg-primary text-white p-4 rounded-lg">
                Tailwind CSS is working! 🎉
              </div>
            </div>
          } 
        />
      </Routes>
    </div>
  )
}

export default App

