import { Provider } from 'react-redux';
import { store } from '@/app/store';
import { AppRouter } from '@/routes/AppRouter';
import { AbilityProvider } from '@/casl/AbilityProvider';

function App() {
  return (
    <Provider store={store}>
      <AbilityProvider>
        <AppRouter />
      </AbilityProvider>
    </Provider>
  );
}

export default App;
