# MedStart Article Studio: image hosting setup

This version keeps Firebase Authentication and Firestore for account sign-in and article data, but uploads article images to Cloudinary instead of Firebase Storage. That avoids requiring Firebase Storage to be enabled. Cloudinary has its own plan limits and terms, so review them before use; this setup does not guarantee unlimited or permanently free hosting.

## A. Create/configure Cloudinary

1. With a parent/guardian's help if needed, create or sign in to a Cloudinary account at https://cloudinary.com/ and review the current plan limits.
2. In the Cloudinary Console, find the **Product environment / Dashboard** and copy the **Cloud name**.
3. Open **Settings → Upload → Upload presets** (the exact menu label may vary).
4. Create a new upload preset and set **Signing Mode** to **Unsigned**.
5. Restrict the preset to image formats such as JPG, JPEG, PNG, and WebP. Keep uploads in a dedicated folder if the console allows it. Do not enable unnecessary file types.
6. Save the preset and copy its exact name.

Unsigned browser uploads can be initiated by anyone who knows the preset name. Restrict the preset to image formats and use it only for this article-image workflow. Do not place an API secret in this site.

## B. Add the values to the code

Open `cloudinary-config.js` and replace the placeholders:

```js
window.MEDSTART_CLOUDINARY_CLOUD_NAME = 'YOUR_CLOUD_NAME';
window.MEDSTART_CLOUDINARY_UPLOAD_PRESET = 'YOUR_UNSIGNED_UPLOAD_PRESET';
```

Use your actual Cloud name and exact unsigned preset name, preserving the quotes. Do not add an API secret.

## C. Publish the updated Studio

1. Upload the contents of this ZIP to the same GitHub repository used by the Article Studio, replacing the old Studio files.
2. Confirm `index.html`, `app.js`, `firebase-config.js`, and `cloudinary-config.js` are in the same folder and are published together.
3. Open the deployed Studio and refresh it. If it still shows old code, do a hard refresh or clear the browser cache.
4. Sign in, choose a small JPG/PNG/WebP image, confirm the preview, then publish a test article.
5. Check that the article record has an `imageUrl` beginning with `https://res.cloudinary.com/` and that the public Articles page uses `imageUrl` or `thumbnail` to display it.

## Troubleshooting

- **Image hosting is not configured yet:** the placeholders in `cloudinary-config.js` were not replaced or the updated file was not deployed.
- **Upload preset not found / unsigned uploads disabled:** check that the preset exists and is set to Unsigned.
- **Invalid cloud name:** copy the Cloud name from the correct Cloudinary product environment.
- **Upload succeeds but article save fails:** this is a Firestore rules/permissions issue, separate from image hosting.
- **Article publishes but image is missing on the public site:** confirm the public Articles page reads `imageUrl` or `thumbnail` from the article document.

The Studio no longer calls Firebase Storage. You do not need to enable Firebase Storage for this code path. Keep your existing Firestore rules in place unless there is a separate database error.
