import { Route, Routes } from 'react-router-dom';
import { NotFound } from '@/pages/NotFound';
import { Reader } from '@/pages/Reader';

export default function App() {
  return <Routes>
    <Route path="/read/book/:slug" element={<Reader kind="book" />} />
    <Route path="/read/comic/:slug" element={<Reader kind="comic" />} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}
