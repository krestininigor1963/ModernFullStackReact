import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Blog } from './Blog.jsx'

//import './App.css' 

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Blog />
    </QueryClientProvider>
  )
}

export default App
