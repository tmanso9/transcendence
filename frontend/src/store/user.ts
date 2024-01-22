import { ref } from "vue";
import { defineStore } from "pinia";
import { apiURI } from "@/utils";

export const useUserStore = defineStore("user", () => {
  const username = ref("");
  const email = ref("");
  const isAdmin = ref(false);
  const points = ref(0);
  const tfa_enabled = ref(false);
  const loginType = ref("REGULAR");
  const alerts = ref([]);
  const id = ref("");
  const status = ref("");

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
      const data = await result.json();
      //   console.log(data);
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
    }
  };

  const logout = async () => {
    try {
      const result = await fetch(`${apiURI}/auth/logout`, {
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
    return await fetch(`${apiURI}/users/me`, {
      credentials: "include",
    });
  };

  const getRefreshMe = async () => {
    return await fetch(`${apiURI}/auth/refresh-token`, {
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
          tfa_enabled.value = refreshData.tfa_enabled;
          email.value = refreshData.email;
          loginType.value = refreshData.login;
          alerts.value = refreshData.alerts;
          id.value = refreshData.id;
          status.value = refreshData.status;
          // console.log(refreshData);
          return;
        }
        throw new Error(JSON.stringify(error));
      }
      const data = await result.json();
      //   console.log("data:");
      //   console.log(data);
      username.value = data.username;
      tfa_enabled.value = data.tfa_enabled;
      email.value = data.email;
      loginType.value = data.login;
      alerts.value = data.alerts;
      id.value = data.id;
      status.value = data.status;
      // console.log(data);
    } catch (error) {
      if (error instanceof Error) {
        const message = JSON.parse(error.message).message;
        console.error(message);
        username.value = "";
      }
    }
  };

  return {
    username,
    isAdmin,
    points,
    tfa_enabled,
    email,
    loginType,
    alerts,
    id,
    status,
    signin,
    logout,
    fetchUser,
  };
});
