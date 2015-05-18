// config/auth.js
module.exports = {
    'development': {
        'facebook': {
            'consumerKey': '566119096861579',
            'consumerSecret': '956db24bef8c6f17f37c1bac6035b388',
            'callbackUrl': 'http://social-auth.com:8000/auth/facebook/callback'
        },
        'twitter': {
            'consumerKey': 'VEaxH72exBjvqldVUltEqoQjd',
            'consumerSecret': '8vEmuMZ1g1DvikpiBB1wSRWlhQe4WzQ9bIICpzu5zkAFRRHP8O',
            'callbackUrl': 'http://social-auth.com:8000/auth/twitter/callback'
        },
        'google': {
            'consumerKey': '446585441765-unda5mjs6307q1pqobvhiqj87m9m2kh1.apps.googleusercontent.com',
            'consumerSecret': '...',
            'callbackUrl': 'http://social-auth.com:8000/auth/google/callback'
        }
    }
}