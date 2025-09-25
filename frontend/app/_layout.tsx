import { Stack } from "expo-router";
import { AlertProvider } from "./components/AppAlert";
import "../polyfills/backhandler";

export default function Layout() {
  return (
    <AlertProvider>
      <Stack initialRouteName="login" />
    </AlertProvider>
  );
}

