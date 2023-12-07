import { ref } from "vue";
import { defineStore } from "pinia";
import { User } from "@/types";

export const useUserStore = defineStore("user", () => {
  const username = ref("");
  const avatar = ref("");
  const isAdmin = ref(false);
  const points = ref(0);

  const login = (user: User) => {
    username.value = user.username || "";
    avatar.value = user.avatar || "";
    points.value = user.points || 0;
    // console.log("Login successful");
  };

  const logout = () => {
    console.log("Logging out");
    username.value = "";
  };

  return { username, isAdmin, points, avatar, login, logout };
});
