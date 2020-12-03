export const log = (message: string, ...args: any[]) => {
  console.log(`[dotenv][DEBUG] ${message}`, ...args);
};
