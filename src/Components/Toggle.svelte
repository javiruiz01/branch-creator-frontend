<script>
  import { theme } from "../Store";

  let selectedTheme;
  theme.subscribe(value => {
    selectedTheme = value;
    document.documentElement.setAttribute("data-theme", value);
  });

  function switchTheme(selected) {
    theme.update(theme => (theme = selected));
  }
</script>

<style>
  .container {
    position: absolute;
    top: 1.875rem;
    right: 1.875rem;
  }

  .toggle {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: var(--theme-background);
    border-radius: 4px;
    position: relative;
  }
  .toggle-light,
  .toggle-dark {
    display: flex;
    justify-content: center;
    font-size: 1rem;
    font-family: "Fira Code", sans-serif;
    z-index: 1;
    padding: 1rem;
    cursor: pointer;
    width: 80px;
  }

  .toggle-light {
    color: var(--theme-font);
  }
  .toggle-dark {
    color: black;
  }

  .selected {
    position: absolute;
    background-color: white;
    border-radius: 4px;
    height: 2.5rem;
    width: 75px;
    top: 4px;
    transition: all 1s ease-in-out;
  }

  .light {
    left: 4px;
  }

  .dark {
    right: 4px;
  }
</style>

<div class="container">
  <div class="toggle">
    <div class="toggle-light" on:click={() => switchTheme('light')}>Ligth</div>
    <div class="toggle-dark" on:click={() => switchTheme('dark')}>Dark</div>
    <div
      class="selected"
      class:light={selectedTheme === 'light'}
      class:dark={selectedTheme === 'dark'} />
  </div>
</div>
