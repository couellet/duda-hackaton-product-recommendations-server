export function getRequestHeaders(): Headers {
    const authToken = btoa(`${process.env.DUDA_API_USERNAME!}:${process.env.DUDA_API_PASSWORD}`);
    return new Headers({
        Authorization: `Basic ${authToken}`,
        Accept: 'application/json'
    });
}

export function getEndpointUrl(endpoint: string): string {
  return `${process.env.DUDA_API_URL!}/api/sites/multiscreen/${process.env.DUDA_SITE_ALIAS}${endpoint}`;
}