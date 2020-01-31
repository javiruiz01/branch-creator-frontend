<script>
  import { searchAzure } from "./azure.service";

  let searchResults = [];
  $: isEmpty = searchResults.length === 0;
  async function handleChange({ target: { value } }) {
    if (!value) {
      searchResults = [];
      return;
    }

    const { results } = await searchAzure(value);
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
    display: flex;
    flex-direction: column;
    width: 75%;
    max-width: 43.75rem;
    min-width: 18.75rem;
    position: relative;
  }

  .search-box {
    width: 100%;
    position: relative;
  }

  .input {
    width: 100%;
    -webkit-appearance: none;
    outline: 0;
    height: 3.438rem;
    padding: 22px 15px 0;
    border: none;
    background-color: #d8d8d840;
    font-size: 1.063rem;
    border-radius: 4px;
  }


  .input:focus + .input__label,
  .input:not(:placeholder-shown) + .input__label {
    top: 0.625rem;
    font-size: 0.75rem;
  }

  .input__label {
    position: absolute;
    left: 1rem;
    top: 1.188rem;
    transition-timing-function: ease-in;
    transition-duration: 125ms;
    font-size: 1.063rem;
    color: #757575;
    pointer-events: none;
  }

  .dirty {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
  }

  .results {
    position: absolute;
    top: 3.4375rem;
    padding: 0.625rem;
    background-color: #d8d8d840;
  }
</style>

<main>
  <div class="center">
    <div class="container">
      <div class="search-box">
        <input
          class="input"
          class:dirty={!isEmpty}
          on:input={handleChange}
          type="text"
					placeholder=" " />
        <span class="input__label">Work Item Id</span>
      </div>

      {#if !isEmpty}
        <ul class="results">
          {#each searchResults as { fields }}
            <li class="result">{fields['system.title']}</li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
</main>
