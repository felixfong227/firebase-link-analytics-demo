var simplemde = new SimpleMDE({
    autosave: true,
    autofocus: true,
    placeholder: "Post Something Here",
    tabSize: 4,
    toolbar: false,
    toolbarTips: false,
    initialValue: `# Hello, for more yiff plz visit [Yiff Party](https://yiff.party)

![pokemon lucario yiff](https://i.kym-cdn.com/photos/images/facebook/000/235/448/8f2.jpg)`
});

const postButton = document.querySelector('#post');
const db = firebase.firestore();
const showPosts = document.querySelector('#showPosts');
const interact = document.querySelector('#interact');
const requestLogin = document.querySelector('#requestLogin');
const loginButton = document.querySelector('#login');
const logoutButton = document.querySelector('#logout');
const authInfo = document.querySelector('#authInfo');

const profilePicture = document.querySelector('#profilePicture');
const profileDisplayName = document.querySelector('#profileDisplayName');

const auth = firebase.auth();

const authProvider = {
    google: new firebase.auth.GoogleAuthProvider(),
}

async function loginWithPopUp() {
    await firebase.auth().signInWithPopup(authProvider.google)
}

auth.onAuthStateChanged(user => {
    if(!user) {
        // Not login
        interact.classList.add('hide');
        requestLogin.classList.remove('hide');
        authInfo.classList.add('hide');
        return;
    }
    // Login user
    authInfo.classList.remove('hide');
    interact.classList.remove('hide');
    requestLogin.classList.add('hide');

    profileDisplayName.innerHTML = user.displayName;
    profilePicture.setAttribute('src', user.photoURL);

    return;
});

loginButton.onclick = event => {
    event.preventDefault();
    loginWithPopUp();
}

logoutButton.onclick = event => {
    event.preventDefault();
    auth.signOut();
}

var converter = new showdown.Converter();

async function savePost() {
    try {
        const userContent = simplemde.value();
        const time = new Date();
        await db.collection('posts').add({
            content: userContent,
            lastEditTime: time,
            createTime: time,
            processing: true,
            author: {
                UID: auth.currentUser.uid,
                displayName: auth.currentUser.displayName,
                profilePicture: auth.currentUser.photoURL
            }
        });
    } catch (err) {
        console.error(err);
    }
}

db.collection('posts').onSnapshot(collectionSnap => {
    showPosts.innerHTML = "";
    collectionSnap.forEach(doc => {

        const data = doc.data();

        const postID = doc.id;
        const postBlock = document.createElement('div');

        postBlock.id = postID;
        postBlock.classList.add('post');

        const contentBlock = document.createElement('p');
        contentBlock.classList.add('content');

        if (data.processing === true) {
            contentBlock.innerHTML = converter.makeHtml(data.content);
            const progressElm = document.createElement('progress');
            contentBlock.appendChild(progressElm);
        } else {
            contentBlock.innerHTML = data.htmlContent;
        }

        const timeBlock = document.createElement('p');
        timeBlock.classList.add('time');
        const fromNow = moment(data.createTime.toDate()).fromNow();
        timeBlock.innerHTML = fromNow;

        const authorElm = document.createElement('div');
        const profilePictureContainer = document.createElement('figure')
        const profilePicture = document.createElement('img')
        const profileDisplayName = document.createElement('span');

        profileDisplayName.innerHTML = `Created By: <strong>${data.author.displayName}</strong>`;
        profileDisplayName.style.marginLeft = '5px';

        profilePictureContainer.className = "image is-32x32";

        profilePicture.className = "is-rounded";
        profilePicture.setAttribute('src', data.author.profilePicture);

        profilePictureContainer.appendChild(profilePicture);

        postBlock.appendChild(profilePictureContainer);
        postBlock.appendChild(profileDisplayName)

        postBlock.appendChild(contentBlock);
        postBlock.appendChild(timeBlock);

        showPosts.appendChild(postBlock);
    });
});

postButton.addEventListener('click', e => {
    e.preventDefault();
    savePost();
});