// Fetch color name from API
export const fetchColorName = async (hex: string): Promise<string | null> => {
  try {
    const hexValue = hex.replace('#', '');
    const response = await fetch(`https://api.color.pizza/v1/?values=${hexValue}`);
    if (!response.ok) {
      throw new Error('Failed to fetch color name');
    }
    const data = await response.json();
    return data.colors?.[0]?.name || null;
  } catch (error) {
    console.error('Error fetching color name:', error);
    return null;
  }
};