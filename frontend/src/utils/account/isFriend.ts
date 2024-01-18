export const isFriend = (
  myFriends: string[],
  myConnections: string[],
  me: any,
  account: any,
) => {
  const friendArr = [];
  for (const friend of myFriends as unknown as Array<string>) {
    friendArr.push(friend);
  }
  const connectionsArr = [];
  for (const connection of myConnections as unknown as Array<Array<string>>) {
    if (connection.length) connectionsArr.push(Array.from(connection));
  }
  let pending = false;
  for (const connection of connectionsArr) {
    if (
      connection.includes(account.username) &&
      connection.includes(me.username)
    ) {
      pending = true;
      break;
    }
  }
  return {
    alreadyFriends: friendArr.includes(account.username),
    pending,
  };
};
