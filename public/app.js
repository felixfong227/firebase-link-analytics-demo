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

        postBlock.appendChild(contentBlock);
        postBlock.appendChild(timeBlock);

        showPosts.appendChild(postBlock);
    });
});

postButton.addEventListener('click', e => {
    e.preventDefault();
    savePost();
});