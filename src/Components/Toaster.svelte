<script>
  import { newBranchName } from "../Store";

  let show = false;

  newBranchName.subscribe(name => {
    if (!name) return;

    show = true;
    setTimeout(() => (show = false), 1500);
  });
</script>

<style>
  .container {
    visibility: hidden;
    position: absolute;
    text-align: center;
    top: -3rem;
    left: 0;
    right: 0;
    margin: auto;
    max-width: 15rem;
    transition-property: all;
    transition-duration: .15s;
    transition-timing-function: ease-in;
  }

  .container.show {
    visibility: visible;
    top: 5%;
  }

  .card {
    padding: 1rem;
    background-color: var(--background-black);
    border-radius: 4px;
    cursor: pointer;
  }

  .message {
    font-size: 1rem;
    font-family: "Fira Code", sans-serif;
    color: white;
  }
</style>

<div class="container" class:show>
  <div class="card">
    <span class="message">Copied to clipboard!</span>
  </div>
</div>
