// OAuth handler for Google and Apple sign-in
// Requires credentials to be set up later in environment variables

export async function handleGoogleSignIn(credentialResponse) {
  try {
    const token = credentialResponse.credential
    if (!token) {
      throw new Error('No credential received from Google')
    }

    // Send token to backend for verification
    const apiUrl = import.meta.env.VITE_API_URL || 'https://femflow-api.onrender.com'
    const response = await fetch(`${apiUrl}/api/v1/auth/google-signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!response.ok) {
      throw new Error(`Google sign-in failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      accessToken: data.access_token,
      user: data.user,
    }
  } catch (error) {
    console.error('Google sign-in error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

