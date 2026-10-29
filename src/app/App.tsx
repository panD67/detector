import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import HomePage from '../features/home/HomePage'
import LinkPage from '../features/link/LinkPage'
import CommentPage from '../features/comment/CommentPage'
import ImagePage from '../features/image/ImagePage'
import HistoryPage from '../features/history/HistoryPage'
import SettingsPage from '../features/settings/SettingsPage'
import NotFoundPage from '../features/not-found/NotFoundPage'
import ScrollToTop from './ScrollToTop'

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="detect/link" element={<LinkPage />} />
          <Route path="detect/comment" element={<CommentPage />} />
          <Route path="detect/image" element={<ImagePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
