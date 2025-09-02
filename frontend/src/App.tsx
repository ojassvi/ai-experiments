import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout';
import Chat from './pages/chat';
import Settings from './pages/settings';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Chat />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
