<script>
  import { searchAzure } from "./azure.service";
  import { throttle } from "./throttle";

  async function handleChange({ target: { value } }) {
    if (!value) {
      return;
    }
    const searchResult = await searchAzure(value);
    console.log(searchResult);
  }
</script>

<style>
  .container {
    display: grid;
    width: 100vw;
    height: 100vh;
    justify-items: center;
    align-items: center;
  }

  input[type="text"] {
    -webkit-appearance: none;
    outline: none;
    height: 3.438rem;
    border: none;
    background-color: #d8d8d840;
    font-size: 1.063rem;
    border-radius: 4px;
    padding: 0 16px;
    width: 50%;
    max-width: 43.75rem;
    min-width: 18.75rem;
  }
</style>

<main>
  <div class="container">
    <input
      on:input={handleChange}
      type="text"
      placeholder="Write here your work item ID" />
  </div>
</main>
