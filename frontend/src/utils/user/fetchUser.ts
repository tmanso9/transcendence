export const fetchUser = async (username: string) => {
  try {
    const result = await fetch(`http://localhost:3000/users/${username}`, {
      credentials: "include",
    });
    if (!result.ok) {
      const error = result.status;
      console.error(result.statusText);
      throw new Error(result.statusText);
    }
    const data = await result.json();
    // console.log(data);
    return data;
  } catch (error) {
    // console.error(error);
	if (error instanceof Error)
		throw new Error(error.message)
  }
};
