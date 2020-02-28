<script>
  export let handleChange;
  export let label = "";
  export let placeholder;
</script>

<style>
  .input-container {
    position: relative;
    width: 100%;
  }

  .input {
    width: 100%;
    -webkit-appearance: none;
    outline: 0;
    height: 3.438rem;
    padding: 1.375rem 0.9375rem 0;
    border: none;
    background-color: var(--theme-background);
    font-size: 1.063rem;
    border-radius: 4px;
    color: var(--theme-font);
  }

  .input:focus {
    border-color: #0070c9;
    box-shadow: 0 0 0 3px rgba(131, 192, 253, 0.5);
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
    color: var(--theme-font-light);
    pointer-events: none;
  }
</style>

<div class="input-container">
  <input
    placeholder="
    "
    id={label}
    class="input"
    on:input={handleChange}
    type="text" />
  <label class="input__label" for={label}>{placeholder}</label>
</div>
