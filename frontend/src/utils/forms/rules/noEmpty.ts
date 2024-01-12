export const noEmpty = [
  (input: string) => {
    if (input) return true;
    return "Required";
  },
];
