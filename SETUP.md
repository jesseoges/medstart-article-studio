MEDSTART PRIVATE ARTICLE STUDIO

This is an admin-only publishing interface, not a public article-reading site. The GitHub Pages files are technically public, so privacy is enforced by Firebase Authentication and Firestore rules. Only the authorized UID can create/edit/publish/delete articles. Published article documents can be read by the original MedStart site; drafts cannot be read by visitors.

1. Upload the CONTENTS of this folder to a separate repository, e.g. medstart-article-studio. Keep index.html in the repository root.
2. Enable GitHub Pages from Settings > Pages > Deploy from a branch > main > /(root).
3. In Firebase Console > Authentication > Sign-in method, enable Email/Password. Under Authentication > Settings, add your GitHub Pages hostname (USERNAME.github.io) to Authorized domains if needed.
4. Sign in with an existing account or use “First time here? Admin sign up” to create one. Copy the UID shown under Firebase Console > Authentication > Users.
5. In firestore.rules, replace REPLACE_WITH_ADMIN_UID with that UID. Publish these rules in Firebase Console > Firestore Database > Rules. Do NOT use unrestricted rules.
6. The admin studio writes to collection `articles`, using `published: true` and `status: "published"`, with title, author, category, imageUrl, thumbnail, summary, content, references, publishedAt, updatedAt, and updatedBy. The original MedStart Articles page should query `articles` where `status == "published"`; for compatibility, ideally query `published == true` or ensure both fields remain consistent. This studio writes both fields consistently.
7. To fix auth/invalid-credential: verify the email exists under Authentication > Users and reset its password if needed. A sign-up attempt with an already registered email should be switched to Sign in.

SECURITY NOTE: The dashboard page itself is hosted publicly as static files and cannot be made unlisted by GitHub Pages. It contains no public article index. Actual data access is enforced by Firestore rules. Never put passwords or service-account keys in this repository.
