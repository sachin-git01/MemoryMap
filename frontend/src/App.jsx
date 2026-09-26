import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { JourneyProvider } from './context/JourneyContext';
import { ThemeProvider } from './context/ThemeProvider';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <JourneyProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </JourneyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
