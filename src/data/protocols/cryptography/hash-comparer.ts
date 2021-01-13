export interface HashComparer {
  compare: (vaue: string, hash: string) => Promise<boolean>
}
