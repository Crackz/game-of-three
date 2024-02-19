export type JoinGameJobMessage = {
  userId: string;
  game: { id: number; isNew: boolean };
};
