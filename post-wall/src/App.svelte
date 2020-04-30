<script>
  import {auth} from "./firebase";
  import AuthInfo from "./components/AuthInfo.svelte";
  import LoginFlow from "./components/LoginFlow.svelte";
  import ListPosts from "./components/ListPosts.svelte";

  let authUser = null;

  auth.onAuthStateChanged(user => (authUser = user));
</script>

<section class="section">
  <div class="container">

    {#if authUser !== null}
      <!-- Show Logged In User Info -->
      <AuthInfo
        displayName={authUser.displayName}
        profilePicture={authUser.photoURL} />
    {:else}
      <!-- Show A Login Button -->
      <LoginFlow />
    {/if}

    <!-- Show a list of posts -->
    <ListPosts />

  </div>
</section>
