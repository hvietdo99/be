export interface Transaction {
  hash: string;
  from: string;
  to: string;
  blockNumber: number;
  value: string;
  input?: string;
}
