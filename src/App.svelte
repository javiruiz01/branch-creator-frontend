<script>
  import { token } from "./Store.js";
  import Footer from "./Components/Footer.svelte";
  import SearchBoxContainer from "./Pages/SearchBoxContainer.svelte";
  import Toaster from "./Components/Toaster.svelte";
  import Token from "./Pages/Token.svelte";
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
    padding-bottom: 40vh;
  }

  .title {
    justify-self: center;
    align-self: center;
    margin-bottom: 1.25rem;
  }

  .title > h1 {
    font-size: 1.5rem;
    font-family: "Fira Code", sans-serif;
  }
</style>

<Toaster />
<main class="center">
  <div class="container">
    <div class="title">
      <h1>Branch creator</h1>
    </div>
    {#if $token}
      <SearchBoxContainer />
    {:else}
      <Token />
    {/if}
  </div>
</main>
<Footer />
