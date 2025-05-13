export async function fetchNutritionData(query) {
    try {
        const response = await fetch(`https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(query)}`, {
            headers: {'X-Api-Key': 'elX/L9X4CiEZ0Aq1v1AODw==c0m4kDhEGyABScmz'}
        });
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        return data.items[0];
    } catch(error) {
        console.error('Nutrition fetch failed:', error);
        return null;
    }
}