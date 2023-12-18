import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const username = ref("");
  const isAdmin = ref(false);
  const points = ref(0);

  const signin = async (urlEncoded: BodyInit, path: URL) => {
    try {
      const result = await fetch(path, {
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlEncoded,
        credentials: "include",
		referrerPolicy: "unsafe-url"
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

  const fetchUser = async (jwt: string) => {
    if (!jwt || !jwt.length) {
      username.value = "";
      return;
    }
    try {
      const result = await fetch("http://localhost:3000/users/me", {
        credentials: "include",
      });
      if (!result.ok) {
		const data = await result.text()
		throw new Error(data)
	  }
      const data = await result.json();
      username.value = data.username;
    } catch (error) {
		if (error instanceof Error) {
			const message = JSON.parse(error.message).message;
			console.error(message);
		}
    }
  };

  return { username, isAdmin, points, signin, logout, fetchUser };
});
