import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const username = ref("");
  const isAdmin = ref(false);
  const points = ref(0);
  const alerts = ref([]);
  const id = ref("");

  const signin = async (urlEncoded: BodyInit, path: URL) => {
    try {
      const result = await fetch(path, {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlEncoded,
        credentials: "include",
      });
      if (!result.ok) {
        const err = await result.text();
        throw new Error(err);
      }
      return await result.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  };

  const logout = async () => {
    try {
      const result = await fetch("http://localhost:3000/auth/logout", {
        credentials: "include",
      });
      if (!result.ok) throw new Error("Error logging out");
      const data = await result.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  const getMe = async () => {
    return await fetch("http://localhost:3000/users/me", {
      credentials: "include",
    });
  };

  const getRefreshMe = async () => {
    return await fetch("http://localhost:3000/auth/refresh-token", {
      credentials: "include",
    });
  };

  const fetchUser = async (jwt: string) => {
    if (!jwt || !jwt.length) {
      username.value = "";
      return;
    }
    try {
      const result = await getMe();
      if (!result.ok) {
        const error = await result.json();
        if (error.statusCode === 401) {
          const refresh = await getRefreshMe();
          if (!refresh.ok) {
            const refreshError = await refresh.text();
            throw new Error(refreshError);
          }
          const refreshData = await refresh.json();
          username.value = refreshData.username;
          alerts.value = refreshData.alerts;
          id.value = refreshData.id;
          console.log(refreshData);
          return;
        }
        throw new Error(JSON.stringify(error));
      }
      const data = await result.json();
      username.value = data.username;
      alerts.value = data.alerts;
      id.value = data.id;
      console.log(data);
    } catch (error) {
      if (error instanceof Error) {
        const message = JSON.parse(error.message).message;
        console.error(message);
        username.value = "";
      }
    }
  };

  return { username, isAdmin, points, alerts, id, signin, logout, fetchUser };
});
