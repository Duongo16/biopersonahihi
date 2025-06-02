import { useEffect, useRef } from "react";
import useAuthStore from "@/store/authStore";

export default function useFetchUserOnce() {
  const { user, setUser } = useAuthStore();
  const fetched = useRef(false);

  useEffect(() => {
    if (!user && !fetched.current) {
      fetched.current = true;

      fetch(`${process.env.NEXT_PUBLIC_AUTH_API}/auth/me`, {
        method: "GET",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch((err) => {
          console.error("Lỗi khi fetch thông tin người dùng:", err);
        });
    }
  }, [user, setUser]);
}
