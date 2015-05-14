// config/auth.js
module.exports = {
  'development': {
    'facebook': {
      'consumerKey': '...',
      'consumerSecret': '...',
      'callbackUrl': '...'
    },
    'twitter': {
      'consumerKey': 'OaPwwyfXjd8WkPzPEWPlpT6Fs',
      'consumerSecret': '...',
      'callbackUrl': 'http://social-authenticator.com:8000/auth/twitter/callback'
    },
    'google': {
      'consumerKey': '446585441765-unda5mjs6307q1pqobvhiqj87m9m2kh1.apps.googleusercontent.com',
      'consumerSecret': '...',
      'callbackUrl': 'http://social-authenticator.com:8000/auth/google/callback'
    }
  }
}
