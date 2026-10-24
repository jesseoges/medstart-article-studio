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


8. PHONE IMAGE UPLOAD: The studio now has an "Article thumbnail image" file picker. On a phone, tap it and choose a photo from Gallery/Photos. Images up to 5 MB upload to Firebase Storage automatically when you save or publish; you no longer need to paste an image URL.
9. In Firebase Console, enable Firebase Storage for project `medstart-aa55c`. Then open Storage > Rules and publish the contents of `storage.rules` included in this ZIP. The rule allows public reads of article images (so public MedStart readers can see them), but only the configured admin UID can upload/delete images. Confirm the UID matches your administrator account before publishing the rules.
10. If Firebase Storage asks you to enable billing or create a storage bucket, follow the Firebase Console's current setup prompts. Until Storage is enabled and its rules are published, image uploads will fail, but you can still save articles without images.


7. **Phone picture uploads:** Firebase Storage must be enabled. Publish `storage.rules` in Firebase Console → Storage → Rules. The rules authorize only the administrator UID above.
8. **Automatic individual HTML pages (one-time server setup):** The browser cannot safely create files in GitHub. The `functions/` folder contains a server-side Firebase Cloud Function that writes `articles/<slug>.html` into the MedStart repository when an article is published. It keeps the GitHub token on the server, never in browser code.
   - Set up Firebase CLI on a computer and run `firebase login`, then `firebase use medstart-aa55c`.
   - From this Studio folder run `firebase init functions` only if the project does not already have a `functions` configuration; keep the provided `functions/index.js` and `functions/package.json`. Ensure `firebase.json` has `{\"functions\":{\"source\":\"functions\"}}` and deploy with `firebase deploy --only functions:publishArticleHtml`.
   - This function requires the Firebase Blaze (pay-as-you-go) plan because it uses server-side functions and Secret Manager. Usage can be small, but billing must be enabled.
   - Create a GitHub fine-grained personal access token limited to the MedStart repository with **Contents: Read and write** only. Do not put it in `firebase-config.js` or any web file. Store it as a Firebase secret: `firebase functions:secrets:set MEDSTART_GITHUB_TOKEN`.
   - Configure function parameters `MEDSTART_GITHUB_OWNER` (your GitHub username/org), `MEDSTART_GITHUB_REPO` (the MedStart repository name), and `MEDSTART_GITHUB_BRANCH` (usually `main`) in the generated `.env.medstart-aa55c` file or deployment environment. Do not guess the repository name.
   - The generated pages are committed into the MedStart repository at `articles/<slug>.html`; GitHub Pages deploys them with the rest of the site. If two article titles make the same slug, adjust one title to make it unique before publishing.
   - First test with a draft/test article. Publishing and deleting/unpublishing should be verified before relying on it.

**Important:** The Cloud Function runs only after it is deployed and configured with the correct GitHub repository and server-side secret. Merely uploading this ZIP does not deploy a cloud function. The MedStart ZIP includes the dynamic Articles listing and vertical navigation, and will link to generated HTML pages when Firestore records have `publicUrl` set.
