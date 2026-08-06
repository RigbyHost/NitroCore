export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    if (event.path && event.path.includes("//")) {
      const normalized = event.path.replace(/\/+/g, "/");
      Object.defineProperty(event, "path", {
        value: normalized,
        writable: true,
        configurable: true,
      });
    }
  });
});
