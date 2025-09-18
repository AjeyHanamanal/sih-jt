// Simple API test utility
export const testApiConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    if (response.ok) {
      const data = await response.json();
      console.log('API Connection successful:', data);
      return true;
    } else {
      console.error('API Connection failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('API Connection error:', error);
    return false;
  }
};
