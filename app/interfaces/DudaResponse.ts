export default interface DudaPagedResponse<T> {
    offset?: number;
    limit?: number;
    total_responses: number;
    results: T[]
  }