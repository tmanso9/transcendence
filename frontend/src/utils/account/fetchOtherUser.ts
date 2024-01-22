import { apiURI } from "../apiURI"

export const fetchOtherUser = async (username: string) => {
  try {
    const result = await fetch(`${apiURI}/users/${username}`, {
      credentials: "include",
    });
    if (!result.ok) {
      console.error(result.statusText);
      throw new Error(result.statusText);
    }
    const data = await result.json();
    return data;
  } catch (error) {
	if (error instanceof Error)
		throw new Error(error.message)
  }
};
