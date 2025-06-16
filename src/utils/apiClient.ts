export const apiClient = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}; 