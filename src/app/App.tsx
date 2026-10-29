import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import HomePage from '../features/home/HomePage'
import ScrollToTop from './ScrollToTop'

const LinkPage = lazy(() => import('../features/link/LinkPage'))
const CommentPage = lazy(() => import('../features/comment/CommentPage'))
const ImagePage = lazy(() => import('../features/image/ImagePage'))
const HistoryPage = lazy(() => import('../features/history/HistoryPage'))
const SettingsPage = lazy(() => import('../features/settings/SettingsPage'))
const NotFoundPage = lazy(() => import('../features/not-found/NotFoundPage'))

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
