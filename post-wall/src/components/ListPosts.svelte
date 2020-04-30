<div>
    {#if posts && posts.length >= 1}
        {#each posts as post}
            <div class="post">

                <div class="authorInfo">
                    <figure class="image is-32x32">
                        <img class="is-rounded" src={post.data.author.profilePicture} alt="Author profile picture">
                    </figure>
                    <span>
                        Created By: <strong>{post.data.author.displayName}</strong>
                    </span>
                </div>

                <div class="content">
                    <!-- User Gen Content -->
                    {@html post.data.htmlContent}
                </div>

            </div>
        {/each}

        {#if gotMore === true}
            <button class="button is-medium is-fullwidth loadMore" on:click={_ => loadMore(3)}>Load More</button>
        {/if}

    {/if}
</div>

<style>

    div {
        margin-top: 2em;
    }

    span {
        margin-left: 5px;
    }

    .post img {
        width: 1000px;
    }

    .loadMore {
        margin-top: 10px;
    }

    progress {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0em;
        left: 0em;
    }

</style>

<script>
    import {db, performance} from '../firebase';

    let initialLoad = true;
    let posts;
    let gotMore = true;
    const INITIAL_FEED_SIZE = 3;

    let lastQuery = null;

    async function loadMore(size=3) {

        if(!gotMore) return false;

        if(posts.length >= 1) {

            const postLoadTrace = performance.trace('loadPosts');

            postLoadTrace.putAttribute("loadSize", `${size}`);

            postLoadTrace.start();

            const lastPost = posts[posts.length - 1];

            const newCollection = await lastQuery.startAfter(lastPost.snap).limit(size).get();

            if(newCollection.size <= 0) {
                gotMore = false;
                return;
            }

            const newlyAddedPosts = [];

            newCollection.forEach(doc => {
                newlyAddedPosts.push(
                        {
                            data: doc.data(),
                            snap: doc,
                        }
                );
            });
            posts = [...posts, ...newlyAddedPosts];
            postLoadTrace.stop();
        }
    }

    function loadPost(limit) {

        let postLoadTrace = performance.trace('initialLoadPosts');

        if(initialLoad) {
            postLoadTrace.putAttribute("initialLoad", "true");
            postLoadTrace.putAttribute("initialLoadSize", `${INITIAL_FEED_SIZE}`);
            postLoadTrace.start();
        }

        const getListOfPostsQuery = db.collection('posts').orderBy('createTime', 'desc').limit(limit);

        getListOfPostsQuery.onSnapshot(collectionSnap => {

            const tmpPosts = [];
            collectionSnap.forEach(doc => {
                tmpPosts.push(
                        {
                            data: doc.data(),
                            snap: doc,
                        }
                )
            });

            posts = tmpPosts;
            if(initialLoad) {
                initialLoad = false;
                postLoadTrace.stop();
            }
        });

        lastQuery = getListOfPostsQuery;

    }

    loadPost(INITIAL_FEED_SIZE);

</script>