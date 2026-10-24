const $=id=>document.getElementById(id);let auth,db,currentUser=null,articles=[],signupMode=false,selectedImageFile=null,previewObjectUrl=null;
function message(id,text,error=false){const el=$(id);if(!el)return;el.textContent=text;el.classList.toggle('error',error)}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function init(){if(!window.firebase||!firebase.apps.length){message('authMessage','Firebase configuration did not load. Check firebase-config.js.',true);return}auth=firebase.auth();db=firebase.firestore();$('modeSwitch').onclick=()=>{signupMode=!signupMode;$('authHeading').textContent=signupMode?'Create your admin account':'Sign in to your studio';$('authAction').textContent=signupMode?'Admin sign up':'Sign in';$('modeSwitch').textContent=signupMode?'Already registered? Sign in':'First time here? Admin sign up';$('password').autocomplete=signupMode?'new-password':'current-password';message('authMessage','')};$('authForm').onsubmit=async e=>{e.preventDefault();const email=$('email').value.trim(),password=$('password').value;message('authMessage',signupMode?'Creating account…':'Signing in…');$('authAction').disabled=true;try{if(signupMode){const result=await auth.createUserWithEmailAndPassword(email,password);message('authMessage','Account created. If publishing is denied, your Firebase UID must be authorized in Firestore rules.');}else{await auth.signInWithEmailAndPassword(email,password);message('authMessage','')}}catch(e){let t=e.code||e.message;if(e.code==='auth/invalid-credential')t='Firebase rejected this email/password. Check Authentication → Users in Firebase Console, confirm this email exists, and reset the password if needed.';if(e.code==='auth/email-already-in-use')t='This email already has an account. Switch to Sign in.';if(e.code==='auth/operation-not-allowed')t='Email/Password sign-in is disabled. Enable it in Firebase Authentication settings.';if(e.code==='auth/unauthorized-domain')t='This website domain is not authorized. Add your GitHub Pages domain in Firebase Authentication settings.';message('authMessage',t,true)}finally{$('authAction').disabled=false}};$('signout').onclick=()=>auth.signOut();$('newArticle').onclick=()=>resetForm();
$('imageFile').addEventListener('change',handleImageSelection);$('cameraFile').addEventListener('change',handleImageSelection);$('chooseGallery').onclick=()=> $('imageFile').click();$('takePhoto').onclick=()=> $('cameraFile').click();
$('removeImage').onclick=()=>{selectedImageFile=null;$('imageFile').value='';$('imageUrl').value='';$('imagePreviewWrap').classList.add('hidden');message('imageMessage','Picture removed.');if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl=null}};
$('saveDraft').onclick=()=>{if($('articleForm').reportValidity())saveArticle(false)};$('articleForm').onsubmit=e=>{e.preventDefault();saveArticle(true)};$('adminArticles').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.edit)editArticle(b.dataset.edit);if(b.dataset.toggle)toggleArticle(b.dataset.toggle);if(b.dataset.delete)deleteArticle(b.dataset.delete)};auth.onAuthStateChanged(async user=>{currentUser=user;$('loginPanel').classList.toggle('hidden',!!user);$('studio').classList.toggle('hidden',!user);$('signout').classList.toggle('hidden',!user);if(user){message('authMessage','');await loadArticles()}})}
function resetForm(){ $('articleForm').reset();selectedImageFile=null;$('imageUrl').value='';$('imagePreviewWrap').classList.add('hidden');message('imageMessage','Optional. You can publish without a picture.');if(previewObjectUrl){URL.revokeObjectURL(previewObjectUrl);previewObjectUrl=null}$('articleId').value='';$('formHeading').textContent='New article';$('publishArticle').textContent='Publish article';message('saveMessage','');window.scrollTo({top:0,behavior:'smooth'})}
function handleImageSelection(){
 const file=($('cameraFile').files&&$('cameraFile').files[0])||($('imageFile').files&&$('imageFile').files[0]);
 if(!file)return;
 if(!file.type.startsWith('image/')){message('imageMessage','Please choose an image file.',true);$('imageFile').value='';return}
 if(file.size>5*1024*1024){message('imageMessage','That image is larger than 5 MB. Choose a smaller picture.',true);$('imageFile').value='';return}
 selectedImageFile=file;
 if(previewObjectUrl)URL.revokeObjectURL(previewObjectUrl);
 previewObjectUrl=URL.createObjectURL(file);
 $('imagePreview').src=previewObjectUrl;
 $('imagePreviewWrap').classList.remove('hidden');
 message('imageMessage',`${file.name} selected. It will upload when you save or publish.`);
}
async function uploadSelectedImage(){
 if(!selectedImageFile)return $('imageUrl').value.trim();
 if(!currentUser)throw new Error('Please sign in before uploading an image.');
 const file=selectedImageFile;
 const cloudName=(window.MEDSTART_CLOUDINARY_CLOUD_NAME||'').trim();
 const uploadPreset=(window.MEDSTART_CLOUDINARY_UPLOAD_PRESET||'').trim();
 if(!cloudName||!uploadPreset||cloudName==='YOUR_CLOUD_NAME'||uploadPreset==='YOUR_UNSIGNED_UPLOAD_PRESET'){
   throw new Error('Image hosting is not configured yet. Follow CLOUDINARY_SETUP.md to add your Cloudinary cloud name and unsigned upload preset in cloudinary-config.js.');
 }
 message('imageMessage','Uploading picture to image hosting…');
 const form=new FormData();
 form.append('file',file);
 form.append('upload_preset',uploadPreset);
 form.append('folder','medstart-articles');
 let response;
 try { response=await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,{method:'POST',body:form}); }
 catch(err){ throw new Error('Could not connect to the image host. Check your internet connection and try again.'); }
 let result={};
 try { result=await response.json(); } catch (_) {}
 if(!response.ok||!result.secure_url){
   const detail=result?.error?.message||`Image host returned HTTP ${response.status}`;
   throw new Error(`Image upload failed: ${detail}. Check the cloud name and unsigned upload preset in cloudinary-config.js.`);
 }
 const url=result.secure_url;
 $('imageUrl').value=url;
 selectedImageFile=null;
 $('imageFile').value='';$('cameraFile').value='';
 message('imageMessage','Picture uploaded successfully and ready to publish.');
 return url;
}
function data(published){const image=$('imageUrl').value.trim();return {title:$('title').value.trim(),author:$('author').value.trim(),category:$('articleCategory').value,imageUrl:image,thumbnail:image,summary:$('summary').value.trim(),content:$('content').value.trim(),references:$('references').value.trim(),published,status:published?'published':'draft',updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:currentUser.uid}}
async function saveArticle(published){if(!currentUser)return;const id=$('articleId').value;if(!$('title').value.trim()||!$('author').value.trim()||!$('summary').value.trim()||!$('content').value.trim()){message('saveMessage','Complete title, author, summary, and article content.',true);return}try{const uploadedUrl=await uploadSelectedImage();$('imageUrl').value=uploadedUrl;const a=data(published);if(id){const old=articles.find(x=>x.id===id);a.publishedAt=published?(old?.publishedAt||firebase.firestore.FieldValue.serverTimestamp()):null;await db.collection('articles').doc(id).update(a)}else{a.createdAt=firebase.firestore.FieldValue.serverTimestamp();a.publishedAt=published?firebase.firestore.FieldValue.serverTimestamp():null;await db.collection('articles').add(a)}message('saveMessage',published?'Published! It should now appear on the original MedStart Articles page.':'Draft saved privately.');resetForm();await loadArticles()}catch(e){message('saveMessage','Could not save: '+(e.code||e.message),true)}}
async function loadArticles(){try{const snap=await db.collection('articles').where('updatedBy','==',currentUser.uid).get();articles=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.updatedAt?.toMillis?.()||0)-(a.updatedAt?.toMillis?.()||0));$('adminCount').textContent=`${articles.length} article${articles.length===1?'':'s'}`;$('adminArticles').innerHTML=articles.length?articles.map(a=>`<div class="adminrow"><div class="rowtitle">${esc(a.title||'Untitled article')}</div><div class="status">${a.published?'Published':'Draft'} · ${esc(a.category||'')}</div><div class="rowactions"><button class="button ghost small" data-edit="${esc(a.id)}">Edit</button><button class="button ghost small" data-toggle="${esc(a.id)}">${a.published?'Unpublish':'Publish'}</button><button class="button danger small" data-delete="${esc(a.id)}">Delete</button></div></div>`).join(''):'<p class="muted">No articles yet. Tap ＋ New article to begin.</p>'}catch(e){$('adminArticles').innerHTML='<p class="message error">Could not load your articles. Check Firestore rules and admin authorization.</p>';message('authMessage','Signed in, but the database denied access: '+(e.code||e.message),true)}}
function editArticle(id){const a=articles.find(x=>x.id===id);if(!a)return;$('articleId').value=id;$('title').value=a.title||'';$('author').value=a.author||'';$('articleCategory').value=a.category||'Clinical Medicine';$('imageUrl').value=a.imageUrl||a.thumbnail||'';selectedImageFile=null;$('imageFile').value='';$('cameraFile').value='';if($('imageUrl').value){$('imagePreview').src=$('imageUrl').value;$('imagePreviewWrap').classList.remove('hidden');message('imageMessage','Current picture loaded. Choose another picture to replace it.')}else{$('imagePreviewWrap').classList.add('hidden');message('imageMessage','Optional. Choose a picture from your phone.')} $('summary').value=a.summary||'';$('content').value=a.content||'';$('references').value=a.references||'';$('formHeading').textContent='Edit article';$('publishArticle').textContent=a.published?'Save changes and publish':'Publish article';window.scrollTo({top:0,behavior:'smooth'})}
async function toggleArticle(id){const a=articles.find(x=>x.id===id);if(!a)return;const published=!a.published;try{await db.collection('articles').doc(id).update({published,status:published?'published':'draft',publishedAt:published?(a.publishedAt||firebase.firestore.FieldValue.serverTimestamp()):null,updatedAt:firebase.firestore.FieldValue.serverTimestamp(),updatedBy:currentUser.uid,thumbnail:a.imageUrl||a.thumbnail||''});await loadArticles()}catch(e){alert('Could not change article status: '+(e.code||e.message))}}
async function deleteArticle(id){const a=articles.find(x=>x.id===id);if(!a||!confirm(`Delete “${a.title}” permanently?`))return;try{await db.collection('articles').doc(id).delete();await loadArticles();if($('articleId').value===id)resetForm()}catch(e){alert('Could not delete: '+(e.code||e.message))}}
init();
