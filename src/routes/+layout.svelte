<script>
  import "$styles/app.css"
  import Nav from '$components/Nav.svelte';
</script>

<div class="min-h-dvh bg-white">
  <Nav />
  <main class="max-w-5xl mx-auto px-4 py-8">
    <slot />
  </main>
  <footer class="border-t py-8 text-center text-sm text-gray-500">© {new Date().getFullYear()} Rodina Vajdovi.cz</footer>
</div>