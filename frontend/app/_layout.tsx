import { Stack, Redirect } from "expo-router";
import "../polyfills/backhandler";
import { AlertProvider } from "./components/AppAlert";

export default function Layout() {
  return (
    <AlertProvider>
      <Redirect href="/login" />
      <Stack />
    </AlertProvider>
  );
}

