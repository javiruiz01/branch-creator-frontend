<script>
  export let handleChange;
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
    color: var(--color-grey);
    pointer-events: none;
  }
</style>

<div class="input-container">
  <input placeholder=" " class="input" on:input={handleChange} type="text" />
  <span class="input__label">{placeholder}</span>
</div>
