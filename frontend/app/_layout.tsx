import { Stack } from "expo-router";
import "../polyfills/backhandler";
import { AlertProvider } from "./components/AppAlert";

export default function Layout() {
  return (
    <AlertProvider>
      <Stack initialRouteName="login" />
    </AlertProvider>
  );
}

