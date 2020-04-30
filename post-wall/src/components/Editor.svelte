<div id="interact" class="hide">
    <textarea name="" id="" cols="30" rows="10" on:load={e => console.log('on load')}></textarea>
    <button class="button is-success" on:click={savePost}>Post</button>
</div>

<script>

    import {onMount} from 'svelte';
    import {auth, analytics, db} from '../firebase';

    onMount(() => {
        window.editor = new window.SimpleMDE({
            autosave: true,
            autofocus: true,
            placeholder: "Post Something Here",
            tabSize: 4,
            toolbar: false,
            toolbarTips: false,
            initialValue: `# Hello, for more yiff plz visit [Yiff Party](https://yiff.party)

![pokemon lucario yiff](https://i.kym-cdn.com/photos/images/facebook/000/235/448/8f2.jpg)`
        });
    });

    async function savePost() {
        try {
            if(!window.editor) {
                console.log("The window.editor object is not yet ready");
                return;
            }
            const userContent = window.editor.value();
            const time = new Date();
            analytics.logEvent('user_create_new_post', {
                userContent,
                user: auth.currentUser,
                navigatorObject: window.navigator,
            });
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

</script>