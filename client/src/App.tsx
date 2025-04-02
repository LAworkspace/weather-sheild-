import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import NotFound from "./pages/not-found";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Claims from "./pages/Claims";
import WeatherData from "./pages/WeatherData";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Web3Provider } from "./lib/web3";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/policies" component={Policies} />
      <Route path="/claims" component={Claims} />
      <Route path="/weather-data" component={WeatherData} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Web3Provider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </Web3Provider>
    </QueryClientProvider>
  );
}

export default App;
