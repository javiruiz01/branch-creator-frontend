<script>
  import { token } from './Store.js';
  import Footer from './Components/Footer.svelte';
  import SearchBoxContainer from './Pages/SearchBoxContainer.svelte';
  import Toaster from './Components/Toaster.svelte';
  import Toggle from './Components/Toggle.svelte';
  import Title from './Components/Title.svelte';
  import Token from './Pages/Token.svelte';
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
</style>

<Toaster />
<main class="center">
  <div class="container">
    <Title />
    {#if $token}
      <SearchBoxContainer />
    {:else}
      <Token />
    {/if}
  </div>
</main>
<Toggle />
<Footer />
