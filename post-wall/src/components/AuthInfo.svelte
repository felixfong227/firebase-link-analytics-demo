<script>
  export let displayName;
  export let profilePicture;
  import { auth, analytics } from "../firebase";
  function logoutButtonOnClick() {
    analytics.logEvent("logout", {
      user: auth.currentUser
    });
    auth.signOut();
  }
</script>

<style>
  .image {
    display: inline-block;
  }

  .image img {
    margin-top: 10px;
  }
</style>

<div class="box hide">
  <div class="media-content">
    <div class="content">
      <span>Login In As</span>
      <span class="image is-32x32">
        <img
          class="is-rounded"
          alt="User's profile picture"
          src={profilePicture} />
      </span>
      <strong>{displayName}</strong>
      <button on:click={logoutButtonOnClick} class="button is-warning">
        Logout
      </button>
    </div>
  </div>
</div>
