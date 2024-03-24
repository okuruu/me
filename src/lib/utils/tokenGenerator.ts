export function generateRandomToken(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
  
    for (let i = 0; i < length - 1; i++) { // Subtracting 1 for suffix
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters.charAt(randomIndex);
    }
  
    // Add random number as suffix
    token += Math.floor(Math.random() * 10); // Random number between 0 and 9
  
    return token;
  }
  