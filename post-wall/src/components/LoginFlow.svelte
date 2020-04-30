<script>
  import { auth, authProviders, analytics } from "../firebase";
  async function loginWithPopupPrompt() {
    await auth.signInWithPopup(authProviders.google);
    analytics.logEvent("login", {
      method: "google",
      user: auth.currentUser
    });
    analytics.setUserId(auth.currentUser.uid);
  }
</script>

<div id="requestLogin">
  <button class="button is-info" on:click={loginWithPopupPrompt}>Login</button>
  <p>To Create New Post</p>
</div>
