import { Store } from "pinia";
import { VueCookies } from "vue-cookies";

export const inviteToGame = async (
  id: string,
  game: Store<"game", any>,
  cookies: VueCookies | undefined,
) => {
  try {
    const result = await fetch(
      `http://localhost:3000/users/game-request/${id}`,
      {
        method: "post",
        credentials: "include",
      },
    );
    if (!result.ok) throw new Error(await result.text());
    const data = await result.text();

    game.connectSocket(cookies?.get("access_token"));
    setTimeout(() => {
      game.goToGame(data);
    }, 300);
  } catch (error) {
    if (error instanceof Error) console.error(error.message);
  }
};
