import * as path from 'path';

export const envFilePaths: string[] = [
  path.join(__dirname, `../../env/${process.env.NODE_ENV}.env.example`),
  path.join(__dirname, `../../env/${process.env.NODE_ENV}.env`),
];
