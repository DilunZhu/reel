import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DiscoverPage from './pages/DiscoverPage'
import ShowDetailPage from './pages/ShowDetailPage'
import FollowingPage from './pages/FollowingPage'
import CalendarPage from './pages/CalendarPage'
import SubscribePage from './pages/SubscribePage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DiscoverPage />} />
        <Route path="/show/:id" element={<ShowDetailPage />} />
        <Route path="/following" element={<FollowingPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/subscribe" element={<SubscribePage />} />
      </Routes>
    </Layout>
  )
}

export default App
