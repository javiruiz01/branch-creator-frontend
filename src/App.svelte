<script>
  import SearchBoxContainer from "./SearchBoxContainer.svelte";
</script>

<style>
  .center {
    display: grid;
    width: 100vw;
    height: 100vh;
    justify-items: center;
    align-items: center;
  }

  .container {
    justify-content: center;
    display: flex;
    flex-direction: column;
    width: 75%;
    max-width: 43.75rem;
    min-width: 18.75rem;
    position: relative;
    padding-bottom: 300px;
  }

  .title {
    justify-self: center;
    align-self: center;
    margin-bottom: 1.25rem;
    font-size: 1.5rem;
    font-family: "Fira Code", sans-serif;
  }

  footer {
    font-family: "Roboto", sans-serif;
    position: absolute;
    text-align: center;
    left: 1%;
    right: 1%;
    bottom: 1.875rem;
    color: rgba(74, 74, 74, 0.5);
    font-size: 1rem;
  }

  footer > a {
    color: rgba(74, 74, 74, 0.5);
  }
</style>

<main class="center">
  <div class="container">
    <div class="title">
      <h1>Branch creator</h1>
    </div>
    <SearchBoxContainer />
  </div>
</main>
<footer>
  Crafted with
  <span style="color: red;">♥</span>
  by
  <a target="_blank" href="https://twitter.com/javiruiz06">@javiruiz06</a>
</footer>
