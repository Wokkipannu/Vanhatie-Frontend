<template>
  <div>
    <footer class="footer">
      <b-container>
        <p><b-icon icon="cone-striped" variant="warning"></b-icon> Vanha tie DKP app by <a href="https://www.wokki.dev/" target="_blank">Wokki</a></p>
      </b-container>
    </footer>
  </div>
</template>

<style>
html, body {
  width: 100%;
  height: 100%;
}

#app {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

main {
  flex-grow: 1;
}

main, .footer {
  flex-shrink: 0;
}
</style>