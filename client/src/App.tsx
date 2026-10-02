import { useEffect } from "react";

import AppRoutes from "@/routes/AppRoutes";

import { initializeAuth } from "@/features/auth/authSlice";
import { useAppDispatch } from "@/store/hooks";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    void dispatch(initializeAuth());
  }, [dispatch]);

  return <AppRoutes />;
}

export default App;