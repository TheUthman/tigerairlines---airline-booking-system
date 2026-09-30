/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./app/store";
import AppRoutes from "./app/routes";
import ToastProvider from "./components/ui/Toast";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
function App() {
  return <ErrorBoundary>
      <ThemeProvider>
        <Provider store={store}>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ToastProvider>
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>;
}
export {
  App as default
};
