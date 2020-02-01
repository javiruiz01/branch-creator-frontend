<script>
  import { searchAzure } from "./azure.service";
  import Input from "./Input.svelte";
  import Loader from "./Loader.svelte";
  import List from "./List.svelte";

  let loading;
  let searchResults = [];

  async function handleChange({ target: { value } }) {
    if (!value) {
      searchResults = [];
      loading = false;
      return;
    }

    loading = true;
    const { results } = await searchAzure(value);
    loading = false;
    searchResults = results;
  }
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

  .search-box {
    width: 100%;
    position: relative;
  }
</style>

<main class="center">
  <div class="container">
    <div class="title">
      <h1>Branch creator</h1>
    </div>
    <div class="search-box">
      <Input {handleChange} placeholder="Work item Id" />
      <Loader {loading} />
      <List list={searchResults} />
    </div>
  </div>
</main>
