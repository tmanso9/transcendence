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
      console.log("Making a request");
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

  return { username, isAdmin, points, signin, logout };
});
