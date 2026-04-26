import { RouterProvider } from "react-router";
import { router } from "@/app/router";
import { AuthProvider } from "@/app/context/AuthContext";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
