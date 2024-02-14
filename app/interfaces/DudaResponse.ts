export default interface DudaResponse<T> {
    offset?: number;
    limit?: number;
    total_responses: number;
    results: T[]
  }