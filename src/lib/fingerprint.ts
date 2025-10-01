// Generate or retrieve a unique fingerprint for anonymous users
export const getFingerprint = (): string => {
  const FINGERPRINT_KEY = 'trutharrow:fingerprint';
  
  let fingerprint = localStorage.getItem(FINGERPRINT_KEY);
  
  if (!fingerprint) {
    // Generate a unique fingerprint
    fingerprint = `fp_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(FINGERPRINT_KEY, fingerprint);
  }
  
  return fingerprint;
};
