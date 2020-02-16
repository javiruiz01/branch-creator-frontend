<style>
  .container {
    position: absolute;
    top: 1rem;
    right: 1rem;
  }

  .toggle {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    background-color: var(--theme-background);
    padding: 1rem;
    border-radius: 4px;
    width: 150px;
    position: relative;
  }
  .light,
  .dark {
    font-size: 1rem;
    font-family: "Fira Code", sans-serif;
    color: black;
    z-index: 1;
    cursor: pointer;
  }

  .selected {
    position: absolute;
    background-color: white;
    border-radius: 4px;
    height: 2.5rem;
    width: 75px;
    top: 4px;
    left: 4px;
  }
</style>

<div class="container">
  <div class="toggle">
    <div class="light">Ligth</div>
    <div class="dark">Dark</div>
    <div class="selected" />
  </div>
</div>
