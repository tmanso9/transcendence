export const signin = async (urlEncoded: BodyInit, path: URL) => {
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
