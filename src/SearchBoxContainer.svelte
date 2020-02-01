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
  .search-box {
    width: 100%;
    position: relative;
  }
</style>

<div class="search-box">
  <Input {handleChange} placeholder="Work item Id" />
  <Loader {loading} />
  <List list={searchResults} />
</div>
