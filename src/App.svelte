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
</style>

<main class="center">
  <div class="container">
    <div class="title">
      <h1>Branch creator</h1>
    </div>
    <SearchBoxContainer />
  </div>
</main>
