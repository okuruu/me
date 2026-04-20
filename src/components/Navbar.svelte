<script lang="ts">
  const navigation = [
    {
      icon: "github.svg",
      redirect: "https://github.com/okuruu",
      alt: "Github",
    },
    { icon: "Quran-book.svg", redirect: "/quran", alt: "Quran" },
    { icon: "Thread.svg", redirect: "/threads", alt: "Threads" },
  ];
</script>

<div
  class="navbar bg-base-100 shadow-lg sticky top-0 z-50 mb-3 rounded-b-xl px-4"
>
  <div class="flex-1">
    <a
      href="/"
      class="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <img src="/icons/Function.svg" alt="Site Icon" class="h-7 w-7" />
      <span class="text-sm font-bold tracking-tight text-white uppercase"
        >okuruu</span
      >
    </a>
  </div>
  <div class="flex-none gap-4">
    {#each navigation as item}
      <a
        href={item.redirect}
        class="btn btn-ghost btn-circle btn-sm hover:bg-white/10 transition-colors"
        title={item.alt}
      >
        <img
          src="/icons/{item.icon}"
          class="h-5 w-5 hover:opacity-100 svg-white"
          alt={item.alt}
        />
      </a>
    {/each}
  </div>
</div>
