import { User } from "@/types";
import { Store } from "pinia";
import { VueCookies } from "vue-cookies";

export const fetchUser = async (
  cookies: VueCookies | undefined,
  user: Store<"user", User>,
) => {
  const jwt = cookies?.get("access_token");
  user.fetchUser && (await user.fetchUser(jwt));
  if (!user.username) {
    cookies?.set("access_token", "");
    cookies?.set("refresh_token", "");
  }
};
