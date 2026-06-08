// OAuth handler for Google and Apple sign-in
// Requires credentials to be set up later in environment variables

export async function handleGoogleSignIn(credentialResponse) {
  try {
    const token = credentialResponse.credential
    if (!token) {
      throw new Error('No credential received from Google')
    }

    // Send token to backend for verification
    const response = await fetch('https://wearable-age-api.onrender.com/auth/google-signin', {
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

export async function handleAppleSignIn(response) {
  try {
    const { authorization } = response
    if (!authorization) {
      throw new Error('No authorization received from Apple')
    }

    const token = authorization.id_token
    if (!token) {
      throw new Error('No ID token from Apple')
    }

    // Send token to backend for verification
    const apiResponse = await fetch('https://wearable-age-api.onrender.com/auth/apple-signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    if (!apiResponse.ok) {
      throw new Error(`Apple sign-in failed: ${apiResponse.statusText}`)
    }

    const data = await apiResponse.json()
    return {
      success: true,
      accessToken: data.access_token,
      user: data.user,
    }
  } catch (error) {
    console.error('Apple sign-in error:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}
