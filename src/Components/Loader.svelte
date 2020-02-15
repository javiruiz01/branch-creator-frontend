<script>
  export let loading;

  $: shouldShow = loading ? "block" : "none";
</script>

<style>
  .loader {
    height: 1.5625rem;
    width: 1.5625rem;
    border-radius: 50%;
    background-color: white;
    border: 1px solid var(--theme-background);
    position: absolute;
    top: 0.9375rem;
    right: 0.9375rem;
    display: var(--shouldShow);
  }

  .loader--inner {
    height: 1.4375rem;
    width: 1.4375rem;
    border: 1px solid white;
    border-top: 1px solid var(--color-blue);
    border-radius: 50%;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>

<div class="loader" style="--shouldShow:{shouldShow}">
  <div class="loader--inner" />
</div>
