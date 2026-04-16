import { useEffect } from "react";
import { clearSession } from "../services/authSession";

export default function LogoutScreen() {
  useEffect(() => {
    const logout = async () => {
      await clearSession();
    };

    logout();
  }, []);

  return null;
}
