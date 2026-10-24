MEDSTART PRIVATE ARTICLE STUDIO

This is an admin-only publishing interface, not a public article-reading site. The GitHub Pages files are technically public, so privacy is enforced by Firebase Authentication and Firestore rules. Only the authorized UID can create/edit/publish/delete articles. Published article documents can be read by the original MedStart site; drafts cannot be read by visitors.

1. Upload the CONTENTS of this folder to a separate repository, e.g. medstart-article-studio. Keep index.html in the repository root.
2. Enable GitHub Pages from Settings > Pages > Deploy from a branch > main > /(root).
3. In Firebase Console > Authentication > Sign-in method, enable Email/Password. Under Authentication > Settings, add your GitHub Pages hostname (USERNAME.github.io) to Authorized domains if needed.
4. Sign in with an existing account or use “First time here? Admin sign up” to create one. Copy the UID shown under Firebase Console > Authentication > Users.
5. In firestore.rules, confirm the UID `smtj86b2YSgSfWEGPZNNmUVdioji` matches your administrator account before publishing rules. If your Firebase Authentication UID is different, replace it in BOTH firestore.rules and storage.rules. Publish these rules in Firebase Console > Firestore Database > Rules. Do NOT use unrestricted rules.
6. The admin studio writes to collection `articles`, using `published: true` and `status: "published"`, with title, author, category, imageUrl, thumbnail, summary, content, references, publishedAt, updatedAt, and updatedBy. The original MedStart Articles page should query `articles` where `status == "published"`; for compatibility, ideally query `published == true` or ensure both fields remain consistent. This studio writes both fields consistently.
7. To fix auth/invalid-credential: verify the email exists under Authentication > Users and reset its password if needed. A sign-up attempt with an already registered email should be switched to Sign in.

SECURITY NOTE: The dashboard page itself is hosted publicly as static files and cannot be made unlisted by GitHub Pages. It contains no public article index. Actual data access is enforced by Firestore rules. Never put passwords or service-account keys in this repository.


8. PHONE IMAGE UPLOAD: The studio now has an "Article thumbnail image" file picker. On a phone, tap it and choose a photo from Gallery/Photos. Images up to 5 MB upload to Firebase Storage automatically when you save or publish; you no longer need to paste an image URL.
9. In Firebase Console, enable Firebase Storage for project `medstart-aa55c`. Then open Storage > Rules and publish the contents of `storage.rules` included in this ZIP. The rule allows public reads of article images (so public MedStart readers can see them), but only the configured admin UID can upload/delete images. Confirm the UID matches your administrator account before publishing the rules.
10. If Firebase Storage asks you to enable billing or create a storage bucket, follow the Firebase Console's current setup prompts. Until Storage is enabled and its rules are published, image uploads will fail, but you can still save articles without images.


IMAGE PICKER FIX: The studio now has separate Choose from Gallery and Take Photo buttons. Gallery uses a standard image file picker, while Take Photo opens the phone camera. The Firestore and Storage rules currently use the same configured admin UID; verify it matches your Firebase Authentication user before deploying.


## Image hosting update

This ZIP now uses Cloudinary for article images instead of Firebase Storage. Follow `CLOUDINARY_SETUP.md` before publishing. Firebase Authentication and Firestore remain in use. The `storage.rules` file is retained for reference but is not used by this version.
