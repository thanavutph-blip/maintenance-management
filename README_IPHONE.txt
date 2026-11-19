# Maintenance Management — iPhone deployment package

This package is prepared for static hosting from a GitHub Pages repository root. Firebase Web config is already present in app.js. Google sign-in uses redirect flow for mobile Safari compatibility.

Files to upload to the root of a GitHub repository: index.html, app.js, style.css, manifest.json. README_TH.md and firestore.rules are reference files; do not upload firestore.rules as a website asset unless desired.

After publishing GitHub Pages, add the exact host (USERNAME.github.io) in Firebase Console > Authentication > Settings > Authorized domains. Then test Google sign-in.

Firebase Hosting deployment itself is not performed by this package; GitHub Pages serves the static website while Firebase Authentication and Firestore remain the backend.
