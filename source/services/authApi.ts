export async function syncAuth(firebaseUser: any, role: string) {
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, role })
  });

  if (!response.ok) throw new Error('Backend auth sync failed');

  const { token } = await response.json();
  localStorage.setItem('lgf_token', token);
  return token;
}
